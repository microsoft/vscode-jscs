import * as path from 'path';
import { window, workspace, commands, Disposable } from 'vscode'; 
import { LanguageClient, LanguageClientOptions, SettingMonitor, RequestType } from 'vscode-languageclient';


export function activate(subscriptions: Disposable[]) { 

	// We need to go one level up since an extension compile the js code into
	// the output folder.
	
	let serverModule = path.join(__dirname, '..', 'server', 'server.js');
	let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };

	let serverOptions = {
		run: { module: serverModule },
		debug: { module: serverModule, options: debugOptions}
	};

	let clientOptions: LanguageClientOptions = {
		languageSelector: ['javascript'],
		synchronize: {
			configurationSection: 'jscs',
			fileEvents: workspace.createFileSystemWatcher('**/.jscsrc')
		}
	}


	let client = new LanguageClient('JSCS', serverOptions, clientOptions);
	subscriptions.push(new SettingMonitor(client, 'jscs.enable').start());


	// commands.registerCommand('extension.sayHello', () => {
	// 	client.sendRequest(MyCommandRequest.type, { command: "jscs-quickfix"}).then((result) => {
	// 		window.showInformationMessage(result.message);
	// 	});
	// });
}