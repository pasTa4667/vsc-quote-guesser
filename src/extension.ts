import * as vscode from 'vscode';
import Api, { quote } from './api/Api';
import QuotesViewProvider from './webview/QuotesViewProvider';

export async function activate(context: vscode.ExtensionContext) {

	console.log('Extension Active!');

	const provider = new QuotesViewProvider(context.extensionUri);

	let activeEditor = vscode.window.activeTextEditor;
	const documentLengthMap: Map<vscode.TextDocument, number> = new Map();

	if(activeEditor) {
		documentLengthMap.set(activeEditor.document, activeEditor.document.getText().length);
	}

	context.subscriptions.push(vscode.commands.registerCommand('quote-guesser.test', async () => {
		await Api.getRandomQuote()
			.then(response => {
				console.log(response)
			})
			.catch(error => {
				console.error('Error:', error.message);
			});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quote-guesser.changeQuote',  async () => {
		await Api.getRandomQuote()
			.then(response => {
				provider.setQuote(response);
				vscode.window.showInformationMessage('New Quote unlocked!');
			})
			.catch(error => {
				console.error('Error:', error.message);
			});
	} ));

	context.subscriptions.push(vscode.commands.registerCommand('quote-guesser.resetScore',  () => {
		provider.resetScore();
	} ));

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(QuotesViewProvider.viewType, provider));


	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(() => {
			activeEditor = vscode.window.activeTextEditor;
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(event => {
			if(!activeEditor) return;

			if(event.document === activeEditor.document) {
				const length = documentLengthMap.get(event.document);

				if(!length) {
					documentLengthMap.set(event.document, event.document.getText().length);
				}

				if(length && length + 100 < event.document.getText().length) {
					vscode.commands.executeCommand('quote-guesser.changeQuote');
					documentLengthMap.set(event.document, event.document.getText().length);
				}
				console.log('Map length', length, 'current length', event.document.getText().length);
			}
		})
	);
	
}



export function deactivate() {}
