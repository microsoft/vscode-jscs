import * as path from 'path';
import { window, workspace, commands } from 'vscode'; 
import { LanguageClient, ClientOptions, ClientStarter, RequestType } from 'vscode-languageclient';

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

export function activate() { 

	// We need to go one level up since an extension compile the js code into
	// the output folder.
	let module = path.join(__dirname, '..', 'bin', 'server', 'server.js');
	console.log(module);
	
	let options = { execArgv: ["--nolazy", "--debug=6004"] };
	let clientOptions: ClientOptions = {
		server: {
			run: { module },
			debug: { module, options}
		},
		syncTextDocument: (textDocument) => textDocument.getLanguageId() === 'javascript',
		configuration: 'eslint',
		fileWatchers: workspace.createFileSystemWatcher('**/.jscsrc')
	}

	let client = new LanguageClient('JSCS', clientOptions);
	new ClientStarter(client).watchSetting('jscs.enable');

	commands.registerCommand('extension.sayHello', () => {
		client.sendRequest(MyCommandRequest.type, { command: "jscs-quickfix"}).then((result) => {
			window.showInformationMessage(result.message);
		});
	});
}