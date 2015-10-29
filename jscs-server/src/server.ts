/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import { ResponseError, RequestType, IRequestHandler, NotificationType, INotificationHandler,
IValidatorConnection, createValidatorConnection, SingleFileValidator, InitializeResult, InitializeError,
IValidationRequestor, ISimpleTextDocument, Diagnostic, Severity, Position, Files,
LanguageServerError, MessageKind } from 'vscode-languageserver';

import fs = require('fs');
import path = require('path');

interface JSCSError {
	additional: any,
	column: number,
	filename: string,
	fixed: any,
	line: number,
	message: string,
	rule: string
}

interface Settings {
	eslint: {
		enable: boolean;
		options: any;
	}
	[key: string]: any;
}

interface JSCSSettings {
	jscs: {
		enable: boolean,
		preset: string,
		configuration: any
	}
}

interface ESLintProblem {
	line: number;
	column: number;
	severity: number;
	ruleId: string;
	message: string;
}

interface ESLintDocumentReport {
	filePath: string;
	errorCount: number;
	warningCount: number;
	messages: ESLintProblem[];
}

interface ESLintReport {
	errorCount: number;
	warningCount: number;
	results: ESLintDocumentReport[];
}

let settings: JSCSSettings = null;
let options: any = null;
let lib: any = null;

function makeDiagnostic(e: JSCSError): Diagnostic {
	// return {
	// 	message: problem.message,
	// 	severity: convertSeverity(problem.severity),
	// 	start: {
	// 		line: problem.line - 1,
	// 		character: problem.column - 1
	// 	}
	// };

	let res: Diagnostic;

	res = {
		message: 'JSCS: ' + e.message,
		// all JSCS errors are Warnings in our world
		severity: Severity.Warning,
		// start alone will select word if in one
		start: {
			line: e.line,
			character: e.column
		},
		code: e.rule
		// Number.MAX_VALUE will select to the end of the line
		// , end: {
		// 	line: e.line,
		// 	character: Number.MAX_VALUE
		// }
	};

	return res;

}

function convertSeverity(severity: number): number {
	switch (severity) {
		// Eslint 1 is warning
		case 1:
			return Severity.Warning;
		case 2:
			return Severity.Error;
		default:
			return Severity.Error;
	}
}


function setConfig(checker: any) {

	checker.registerDefaultRules();

	if (settings) {

		if (settings.jscs.enable) {
			if (settings.jscs.enable === false) {
				return;
			}
		}

		if (settings.jscs.configuration) {
			checker.configure(settings.jscs.configuration);
		} else {
			if (settings.jscs.preset) {
				checker.configure({ "preset": settings.jscs.preset });
			}
		}

	} else {
		settings.jscs.preset = 'airbnb';
		checker.configure({
			"preset": settings.jscs.preset
		});
	}

}

let connection: IValidatorConnection = createValidatorConnection(process.stdin, process.stdout);



let validator: SingleFileValidator = {
	initialize: (rootFolder: string): Thenable<InitializeResult | ResponseError<InitializeError>> => {
		return Files.resolveModule(rootFolder, 'jscs').then((value): InitializeResult | ResponseError<InitializeError> => {
			lib = value;
			return null;
		}, (error) => {
			return Promise.reject(
				new ResponseError<InitializeError>(99,
					'Failed to load eslint library. Please install eslint in your workspace folder using \'npm install eslint\' and then press Retry.',
					{ retry: true }));
		});
	},

	onConfigurationChange(_settings: JSCSSettings, requestor: IValidationRequestor): void {
		settings = _settings;
		requestor.all();
	},

	validate: (document: ISimpleTextDocument): Diagnostic[] => {

		console.log("in validate");

		

		let checker = new lib();

		checker.registerDefaultRules();

		if (settings.jscs.preset) {
			checker.configure({
				"preset": settings.jscs.preset
			});
		} else if (settings.jscs.configuration) {
			checker.configure(settings.jscs.configuration);
		} else {
			// TODO provide some sort of warning that there is no config
			// use jquery by default
			checker.configure('jquery');
		}

		let result: Diagnostic[] = [];
		let fileContents = document.getText();
		let results = checker.checkString(fileContents);
		let errors: JSCSError[] = results.getErrorList();

		if (errors.length > 0) {
			errors.forEach((e) => {
				result.push(makeDiagnostic(e));
			})
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

export namespace MyCommandRequest {
	export let type: RequestType<MyCommandParams, MyCommandResult, MyCommandError> = { method: 'jscs/myCommand' };
}
export interface MyCommandParams {
	command: string;
}
export interface MyCommandResult {
	message: string;
}
export interface MyCommandError {
}

connection.onRequest(MyCommandRequest.type, (params) => {
	return { message: `Recevied command ${params.command}` };
});

connection.run(validator);