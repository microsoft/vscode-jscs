/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import {
	createConnection, IConnection,
	ResponseError, RequestType, IRequestHandler, NotificationType, INotificationHandler,
	InitializeResult, InitializeError,
	Diagnostic, Severity, Position, Files,
	TextDocuments, ITextDocument, TextDocumentSyncKind,
	ErrorMessageTracker
} from 'vscode-languageserver';

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

interface JSCSSettings {
	jscs: {
		enable: boolean,
		preset: string,
		configuration: any
	}
}

let settings: JSCSSettings = null;
let options: any = null;
let lib: any = null;
let connection: IConnection = createConnection(process.stdin, process.stdout);
let documents: TextDocuments = new TextDocuments();

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

function validateSingle(document: ITextDocument): void {
	try {
		validate(document);
	} catch (err) {
		connection.window.showErrorMessage(getMessage(err, document));
	}
}

function validateMany(documents: ITextDocument[]): void {
	let tracker = new ErrorMessageTracker();
	documents.forEach(document => {
		try {
			validate(document);
		} catch (err) {
			tracker.add(getMessage(err, document));
		}
	});
	tracker.sendErrors(connection);
}

function validate(document: ITextDocument): void {

		let checker = new lib();
		let fileContents = document.getText();
		let uri = document.uri;
		
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

		let diagnostics: Diagnostic[] = [];
		let results = checker.checkString(fileContents);
		let errors: JSCSError[] = results.getErrorList();

		if (errors.length > 0) {
			errors.forEach((e) => {
				diagnostics.push(makeDiagnostic(e));
			})
		}

	return connection.sendDiagnostics({ uri, diagnostics });

}

function makeDiagnostic(e: JSCSError): Diagnostic {

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

function getMessage(err: any, document: ITextDocument): string {
	let result: string = null;
	if (typeof err.message === 'string' || err.message instanceof String) {
		result = <string>err.message;
		result = result.replace(/\r?\n/g, ' ');
		if (/^CLI: /.test(result)) {
			result = result.substr(5);
		}
	} else {
		result = `An unknown error occured while validating file: ${Files.uriToFilePath(document.uri)}`;
	}
	return result;
}

// The documents manager listen for text document create, change
// and close on the connection
documents.listen(connection);
// A text document has changed. Validate the document.
documents.onDidChangeContent((event) => {
	validateSingle(event.document);
});

connection.onInitialize((params): Thenable<InitializeResult | ResponseError<InitializeError>> => {
	let rootFolder = params.rootFolder;
	return Files.resolveModule(rootFolder, 'jscs').then((value): InitializeResult | ResponseError<InitializeError> => {
		lib = value;
		let result: InitializeResult = { capabilities: { textDocumentSync: documents.syncKind }};
		return result;
	}, (error) => {
		return Promise.reject(
			new ResponseError<InitializeError>(99,
				'Failed to load jscs library. Please install jscs in your workspace folder using \'npm install jscs\' and then press Retry.',
				{ retry: true }));
	});
});

connection.onDidChangeConfiguration((params) => {
	settings = params.settings;
	// if (settings.eslint) {
	// 	options = settings.eslint.options || {};
	// }
	// Settings have changed. Revalidate all documents.
	validateMany(documents.all());
});

connection.onDidChangeWatchedFiles((params) => {
	// A .jscsrc has change. No smartness here.
	// Simply revalidate all file.
	validateMany(documents.all());
});

connection.listen();
