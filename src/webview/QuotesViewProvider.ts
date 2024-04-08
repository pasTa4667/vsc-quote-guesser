import * as vscode from 'vscode';
import { quote } from '../api/Api';

interface message<T> {
    type: string;
    value: T;
}

export default class QuotesViewProvider implements vscode.WebviewViewProvider{

    public static readonly viewType = 'quote-guesser.quotesView';

	private _view?: vscode.WebviewView;
    private quote: quote | null = null;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

    public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'changeQuote':
					{
						console.log('messsage received in webview', data.value);
						break;
					}
                case 'testing':
                    {
                        console.log('test received from webview: ', data.value);
                        break;
                    }
			}
		});
	}

    setQuote(quote: quote) {
        this.quote = quote;
        const message = { type: 'changeQuote', value: { content: quote.content, author: quote.author } };
        console.log("SETTING QUOTE:", quote);
        this.sendMessage(message);
    }

    getQuote() {
        return this.quote;
    }

    resetScore() {
        this.sendMessage({ type: 'resetScore', value: 0})
    }

    private sendMessage<T>(message: message<T>) {
        if(this._view) {
            this._view.show?.(true);
            this._view?.webview.postMessage(message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <link href="${styleResetUri}" rel="stylesheet">
            <link href="${styleVSCodeUri}" rel="stylesheet">
            <link href="${styleMainUri}" rel="stylesheet">

            <title>Quote Guesser</title>
        </head>
        <body>
            <div class="main-container">
                <div class="quote">${this.getQuote()?.content ?? ''}</div>
                
                <input id="author-input" type="text" placeholder="- author"/>

                <table>
                    <tr>
                        <th>Score</th>
                        <th>Correct</th>
                        <th>False</th>
                    </tr>
                    <tr>
                        <td id="scoreValue">0</td>
                        <td id="correctValue">0</td>
                        <td id="falseValue">0</td>
                    </tr>
                </table>

                <button id="answer-button">Show Answer</button>
            </div>

            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
	}

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}