/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode_languageserver_1 = require('vscode-languageserver');
var configCache = {
    filePath: null,
    configuration: null
};
var settings = null;
var options = null;
var linter = null;
var configLib = null;
var connection = vscode_languageserver_1.createConnection(process.stdin, process.stdout);
var documents = new vscode_languageserver_1.TextDocuments();
function getConfiguration(filePath) {
    if (configCache.configuration && configCache.filePath === filePath) {
        return configCache.configuration;
    }
    configCache = {
        filePath: filePath,
        configuration: configLib.load(false, filePath)
    };
    return configCache.configuration;
}
function flushConfigCache() {
    configCache = {
        filePath: null,
        configuration: null
    };
}
function validateSingle(document) {
    try {
        validate(document);
    }
    catch (err) {
        connection.window.showErrorMessage(getMessage(err, document));
    }
}
function validateMany(documents) {
    var tracker = new vscode_languageserver_1.ErrorMessageTracker();
    documents.forEach(function (document) {
        try {
            validate(document);
        }
        catch (err) {
            tracker.add(getMessage(err, document));
        }
    });
    tracker.sendErrors(connection);
}
function validate(document) {
    var checker = new linter();
    var fileContents = document.getText();
    var uri = document.uri;
    checker.registerDefaultRules();
    var config = getConfiguration(uri);
    if (settings.jscs.configuration) {
        options = settings.jscs.configuration;
    }
    else if (settings.jscs.preset) {
        options = {
            "preset": settings.jscs.preset
        };
    }
    else {
        // TODO provide some sort of warning that there is no config
        // use jquery by default
        options = { "preset": "jquery" };
    }
    checker.configure(config || options);
    // this.jscs.configure(config || options);
    // if (!config && this.onlyConfig) return [];
    var diagnostics = [];
    var results = checker.checkString(fileContents);
    var errors = results.getErrorList();
    // test for checker.maxErrorsExceeded();
    if (errors.length > 0) {
        errors.forEach(function (e) {
            diagnostics.push(makeDiagnostic(e));
        });
    }
    return connection.sendDiagnostics({ uri: uri, diagnostics: diagnostics });
}
function makeDiagnostic(e) {
    var res;
    res = {
        message: 'JSCS: ' + e.message,
        // all JSCS errors are Warnings in our world
        severity: vscode_languageserver_1.Severity.Warning,
        // start alone will select word if in one
        start: {
            line: e.line - 1,
            character: e.column
        },
        end: {
            line: e.line - 1,
            character: Number.MAX_VALUE
        },
        code: e.rule
    };
    return res;
}
function getMessage(err, document) {
    var result = null;
    if (typeof err.message === 'string' || err.message instanceof String) {
        result = err.message;
        result = result.replace(/\r?\n/g, ' ');
        if (/^CLI: /.test(result)) {
            result = result.substr(5);
        }
    }
    else {
        result = "An unknown error occured while validating file: " + vscode_languageserver_1.Files.uriToFilePath(document.uri);
    }
    return result;
}
// The documents manager listen for text document create, change
// and close on the connection
documents.listen(connection);
// A text document has changed. Validate the document.
documents.onDidChangeContent(function (event) {
    validateSingle(event.document);
});
connection.onInitialize(function (params) {
    var rootFolder = params.rootFolder;
    return vscode_languageserver_1.Files.resolveModule(rootFolder, 'jscs').then(function (value) {
        linter = value;
        return vscode_languageserver_1.Files.resolveModule(rootFolder, 'jscs/lib/cli-config').then(function (value) {
            configLib = value;
            return { capabilities: { textDocumentSync: documents.syncKind } };
        }, function (error) {
            return Promise.reject(new vscode_languageserver_1.ResponseError(99, 'Failed to load jscs/lib/cli-config library. Please install jscs in your workspace folder using \'npm install jscs\' and then press Retry.', { retry: true }));
        });
    }, function (error) {
        return Promise.reject(new vscode_languageserver_1.ResponseError(99, 'Failed to load jscs library. Please install jscs in your workspace folder using \'npm install jscs\' and then press Retry.', { retry: true }));
    });
});
connection.onDidChangeConfiguration(function (params) {
    flushConfigCache();
    settings = params.settings;
    // if (settings.eslint) {
    // 	options = settings.eslint.options || {};
    // }
    // Settings have changed. Revalidate all documents.
    validateMany(documents.all());
});
connection.onDidChangeWatchedFiles(function (params) {
    // A .jscsrc has change. No smartness here.
    // Simply revalidate all file.
    flushConfigCache();
    validateMany(documents.all());
});
connection.listen();
//# sourceMappingURL=server.js.map