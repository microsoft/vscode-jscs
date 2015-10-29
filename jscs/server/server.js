/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode_languageserver_1 = require('vscode-languageserver');
var settings = null;
var options = null;
var lib = null;
function makeDiagnostic(e) {
    // return {
    // 	message: problem.message,
    // 	severity: convertSeverity(problem.severity),
    // 	start: {
    // 		line: problem.line - 1,
    // 		character: problem.column - 1
    // 	}
    // };
    var res;
    res = {
        message: 'JSCS: ' + e.message,
        // all JSCS errors are Warnings in our world
        severity: vscode_languageserver_1.Severity.Warning,
        // start alone will select word if in one
        start: {
            line: e.line,
            character: e.column
        },
        code: e.rule
    };
    return res;
}
function convertSeverity(severity) {
    switch (severity) {
        // Eslint 1 is warning
        case 1:
            return vscode_languageserver_1.Severity.Warning;
        case 2:
            return vscode_languageserver_1.Severity.Error;
        default:
            return vscode_languageserver_1.Severity.Error;
    }
}
function setConfig(checker) {
    checker.registerDefaultRules();
    if (settings) {
        if (settings.jscs.enable) {
            if (settings.jscs.enable === false) {
                return;
            }
        }
        if (settings.jscs.configuration) {
            checker.configure(settings.jscs.configuration);
        }
        else {
            if (settings.jscs.preset) {
                checker.configure({ "preset": settings.jscs.preset });
            }
        }
    }
    else {
        settings.jscs.preset = 'airbnb';
        checker.configure({
            "preset": settings.jscs.preset
        });
    }
}
var connection = vscode_languageserver_1.createValidatorConnection(process.stdin, process.stdout);
var validator = {
    initialize: function (rootFolder) {
        return vscode_languageserver_1.Files.resolveModule(rootFolder, 'jscs').then(function (value) {
            lib = value;
            return null;
        }, function (error) {
            return Promise.reject(new vscode_languageserver_1.ResponseError(99, 'Failed to load eslint library. Please install eslint in your workspace folder using \'npm install eslint\' and then press Retry.', { retry: true }));
        });
    },
    onConfigurationChange: function (_settings, requestor) {
        settings = _settings;
        requestor.all();
    },
    validate: function (document) {
        console.log("in validate");
        var checker = new lib();
        checker.registerDefaultRules();
        if (settings.jscs.preset) {
            checker.configure({
                "preset": settings.jscs.preset
            });
        }
        else if (settings.jscs.configuration) {
            checker.configure(settings.jscs.configuration);
        }
        else {
            // TODO provide some sort of warning that there is no config
            // use jquery by default
            checker.configure('jquery');
        }
        var result = [];
        var fileContents = document.getText();
        var results = checker.checkString(fileContents);
        var errors = results.getErrorList();
        if (errors.length > 0) {
            errors.forEach(function (e) {
                result.push(makeDiagnostic(e));
            });
        }
        return result;
        // let CLIEngine = lib.CLIEngine;
        // try {
        // 	var cli = new CLIEngine(options);
        // 	let content = document.getText();
        // 	let uri = document.uri;
        // 	let report: ESLintReport = cli.executeOnText(content, Files.uriToFilePath(uri));
        // 	let diagnostics: Diagnostic[] = [];
        // 	if (report && report.results && Array.isArray(report.results) && report.results.length > 0) {
        // 		let docReport = report.results[0];
        // 		if (docReport.messages && Array.isArray(docReport.messages)) {
        // 			docReport.messages.forEach((problem) => {
        // 				if (problem) {
        // 					diagnostics.push(makeDiagnostic(problem));
        // 				}
        // 			});
        // 		}
        // 	}
        // 	return diagnostics;
        // } catch (err) {
        // 	let message: string = null;
        // 	if (typeof err.message === 'string' || err.message instanceof String) {
        // 		message = <string>err.message;
        // 		message = message.replace(/\r?\n/g, ' ');
        // 		if (/^CLI: /.test(message)) {
        // 			message = message.substr(5);
        // 		}
        // 		throw new LanguageServerError(message, MessageKind.Show);
        // 	}
        // 	throw err;
        // }
    }
};
var MyCommandRequest;
(function (MyCommandRequest) {
    MyCommandRequest.type = { method: 'jscs/myCommand' };
})(MyCommandRequest = exports.MyCommandRequest || (exports.MyCommandRequest = {}));
connection.onRequest(MyCommandRequest.type, function (params) {
    return { message: "Recevied command " + params.command };
});
connection.run(validator);
//# sourceMappingURL=server.js.map