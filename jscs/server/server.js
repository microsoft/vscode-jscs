/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var server = require('vscode-languageserver');
var configCache = {
    filePath: null,
    configuration: null
};
var settings = null;
var options = null;
var linter = null;
var configLib = null;
var connection = server.createConnection(process.stdin, process.stdout);
var documents = new server.TextDocuments();
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
    var tracker = new server.ErrorMessageTracker();
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
function validate(document) {
    try {
        var checker = new linter();
        var fileContents = document.getText();
        var uri = document.uri;
        var fsPath = server.Files.uriToFilePath(uri);
        var config = getConfiguration(fsPath);
        if (!config && settings.jscs.disableIfNoConfig) {
            return;
        }
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
        // configure jscs module
        checker.registerDefaultRules();
        checker.configure(config || options);
        var diagnostics_1 = [];
        var results = checker.checkString(fileContents);
        var errors = results.getErrorList();
        // test for checker.maxErrorsExceeded();
        if (errors.length > 0) {
            errors.forEach(function (e) {
                diagnostics_1.push(makeDiagnostic(e));
            });
        }
        //return connection.sendDiagnostics({ uri, diagnostics });
        connection.sendDiagnostics({ uri: uri, diagnostics: diagnostics_1 });
    }
    catch (err) {
        var message = null;
        if (typeof err.message === 'string' || err.message instanceof String) {
            message = err.message;
            throw new Error(message);
        }
        throw err;
    }
}
function makeDiagnostic(e) {
    var res;
    res = {
        message: e.message,
        // all JSCS errors are Warnings in our world
        severity: 2 /* Warning */,
        // start alone will select word if in one
        range: {
            start: {
                line: e.line - 1,
                character: e.column
            },
            end: {
                line: e.line - 1,
                character: Number.MAX_VALUE
            }
        },
        code: e.rule,
        source: 'JSCS'
    };
    return res;
}
function getMessage(err, document) {
    var result = null;
    if (typeof err.message === 'string' || err.message instanceof String) {
        result = err.message;
        result = result.replace(/\r?\n/g, ' ');
    }
    else {
        result = "An unknown error occured while validating file: " + server.Files.uriToFilePath(document.uri);
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
    var rootPath = params.rootPath;
    return server.Files.resolveModule(rootPath, 'jscs').then(function (value) {
        linter = value;
        return server.Files.resolveModule(rootPath, 'jscs/lib/cli-config').then(function (value) {
            configLib = value;
            return { capabilities: { textDocumentSync: documents.syncKind } };
        }, function (error) {
            return Promise.reject(new server.ResponseError(99, 'Failed to load jscs/lib/cli-config library. Please install jscs in your workspace folder using \'npm install jscs\' and then press Retry.', { retry: true }));
        });
    }, function (error) {
        return Promise.reject(new server.ResponseError(99, 'Failed to load jscs library. Please install jscs in your workspace folder using \'npm install jscs\' and then press Retry.', { retry: true }));
    });
});
connection.onDidChangeConfiguration(function (params) {
    flushConfigCache();
    settings = params.settings;
    validateMany(documents.all());
});
connection.onDidChangeWatchedFiles(function (params) {
    flushConfigCache();
    validateMany(documents.all());
});
connection.listen();
//# sourceMappingURL=server.js.map