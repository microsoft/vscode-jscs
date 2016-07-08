/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import * as server from 'vscode-languageserver';
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
	jscs: {
		enable: boolean;
		preset: string;
		configuration: any;
		disableIfNoConfig: boolean;
		displaySeverity: server.DiagnosticSeverity;
	}
}


let configCache = {
	filePath: <string>null,
	configuration: <any>null
}

let settings: Settings = null;
let options: {} = null;
let linter: any = null;
let configLib: any = null;
let connection: server.IConnection = server.createConnection(process.stdin, process.stdout);
let documents: server.TextDocuments = new server.TextDocuments();

function flushConfigCache() {
	configCache = {
		filePath: null,
		configuration: null
	}
}

function validateSingle(document: server.TextDocument): void {
	try {
		validate(document);
	} catch (err) {
		connection.window.showErrorMessage(getMessage(err, document));
	}
}

function validateMany(documents: server.TextDocument[]): void {
	let tracker = new server.ErrorMessageTracker();
	documents.forEach(document => {
		try {
			validate(document);
		} catch (err) {
			tracker.add(getMessage(err, document));
		}
	});
	tracker.sendErrors(connection);
}

function getConfiguration(filePath: string): any {

	if (configCache.configuration && configCache.filePath === filePath) {
		return configCache.configuration;
	}

	configCache = {
		filePath: filePath,
		configuration: configLib.load(false, filePath)
	}

	return configCache.configuration;
}

function validate(document: server.TextDocument): void {

	try {

		let checker = new linter();
		let fileContents = document.getText();
		let uri = document.uri;
		let fsPath = server.Files.uriToFilePath(uri);


		let config = getConfiguration(fsPath);

		if (!config && settings.jscs.disableIfNoConfig) {
			return;
		}

		if (settings.jscs.configuration) {
			options = settings.jscs.configuration;
		} else if (settings.jscs.preset) {
			options = {
				"preset": settings.jscs.preset
			};
		} else {
			// TODO provide some sort of warning that there is no config
			// use jquery by default
			options = { "preset": "jquery" };
		}

		// configure jscs module
		checker.registerDefaultRules();
		checker.configure(config || options);

		let diagnostics: server.Diagnostic[] = [];
		let results = checker.checkString(fileContents);
		let errors: JSCSError[] = results.getErrorList();

		// test for checker.maxErrorsExceeded();

		if (errors.length > 0) {
			errors.forEach((e) => {
				diagnostics.push(makeDiagnostic(e));
			})
		}

		//return connection.sendDiagnostics({ uri, diagnostics });
		connection.sendDiagnostics({ uri, diagnostics });

	} catch (err) {
		let message: string = null;
		if (typeof err.message === 'string' || err.message instanceof String) {
			message = <string>err.message;
			throw new Error(message);
		}
		throw err;
	}
}

function makeDiagnostic(e: JSCSError): server.Diagnostic {

	let res: server.Diagnostic;

	res = {
		message: e.message,
		// all JSCS errors are Warnings in our world
		severity: server.DiagnosticSeverity.Warning,
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

function getMessage(err: any, document: server.TextDocument): string {
	let result: string = null;
	if (typeof err.message === 'string' || err.message instanceof String) {
		result = <string>err.message;
		result = result.replace(/\r?\n/g, ' ');
	} else {
		result = `An unknown error occured while validating file: ${server.Files.uriToFilePath(document.uri)}`;
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

connection.onInitialize((params): Thenable<server.InitializeResult | server.ResponseError<server.InitializeError>> => {
	let rootPath = params.rootPath;

	return server.Files.resolveModule(rootPath, 'jscs').then((value) => {
		linter = value;
		return server.Files.resolveModule(rootPath, 'jscs/lib/cli-config').then((value) => {
			configLib = value;


			return { capabilities: { textDocumentSync: documents.syncKind } };
		}, (error) => {
			return Promise.reject(
				new server.ResponseError<server.InitializeError>(99,
					'Failed to load jscs/lib/cli-config library. Please install jscs in your workspace folder using \'npm install jscs\' and then press Retry.',
					{ retry: true }));
		});
	}, (error) => {
		return Promise.reject(
			new server.ResponseError<server.InitializeError>(99,
				'Failed to load jscs library. Please install jscs in your workspace folder using \'npm install jscs\' and then press Retry.',
				{ retry: true }));
	});

})

connection.onDidChangeConfiguration((params) => {
	flushConfigCache();
	settings = params.settings;
	validateMany(documents.all());
});

connection.onDidChangeWatchedFiles((params) => {
    flushConfigCache();
	validateMany(documents.all());
});

connection.listen();
