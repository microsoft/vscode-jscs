import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode'; 
import { LanguageClient, LanguageClientOptions, SettingMonitor } from 'vscode-languageclient';


export function activate(context: ExtensionContext) { 

	// We need to go one level up since an extension compile the js code into
	// the output folder.
	
	let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
	
	// TIP! change --debug to --debug-brk to debug initialization code in the server
	// F5 the extension and then F5 (Attach) the server instance
	let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
	let serverOptions = {
		run: { module: serverModule },
		debug: { module: serverModule, options: debugOptions}
	};

	let clientOptions: LanguageClientOptions = {
		documentSelector: [
			{
				language: 'javascript',
				scheme: 'file'
			},
			{
				language: 'javascriptreact',
				scheme: 'file'
			}
		],
		synchronize: {
			configurationSection: 'jscs',
			fileEvents: workspace.createFileSystemWatcher('**/.jscsrc')
		}
	}

	let client = new LanguageClient('JSCS', serverOptions, clientOptions);
	
	context.subscriptions.push(new SettingMonitor(client, 'jscs.enable').start());

	// commands.registerCommand('jscs.fixFile', () => {
	// 	client.sendRequest(MyCommandRequest.type, { command: "jscs-quickfix"}).then((result) => {
	// 		window.showInformationMessage(result.message);
	// 	});
	// });
}
