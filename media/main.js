//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const state = vscode.getState() || { quoteState: { content: 'No quote unlocked.', author: 'pasta' }, scoreState: { points: 0, correctCount: 0, falseCount: 0 }, guessedState: { guessed: false } };

    /**
    * @type {{ content: string, author: string }}
    */
    let quoteState = state.quoteState;

    /**
    * @type {{ points: number, correctCount: number, falseCount: number }}
    */
    let scoreState = state.scoreState;

    /**
    * @type {{ guessed: boolean }}
    */
    let guessedState = state.guessedState || { guessed: false };

    const inputElement = document.getElementById('author-input');
    
    inputElement.addEventListener('keydown', (event) => {
        if(event.keyCode === 13) { // .key === 'Enter' does not work
            checkAuthor(inputElement.value);
        }
    });
    
    document.getElementById('answer-button').addEventListener('click', () => {
        showAnswer();
    });
    
    updateQuote(quoteState);
    updateScoreboard(scoreState);
    
    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        console.log("in event listener", event.data);
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'changeQuote':
                {
                    updateQuote(message.value);
                    break;
                }
                case 'resetScore': 
                {
                    updateScoreboard({ points: 0, correctCount: 0, falseCount: 0 });
                    break;
                }
            }
        });
        
        /**
     * Updates the score board
     * @param {{ points: number, correctCount: number, falseCount: number }} newScoreState - The score for updating
     */
    function updateScoreboard(newScoreState) {
        const scoreValue = document.getElementById('scoreValue');
        const correctValue = document.getElementById('correctValue');
        const falseValue = document.getElementById('falseValue');

        scoreValue.textContent = newScoreState.points; 
        correctValue.textContent = newScoreState.correctCount;
        falseValue.textContent = newScoreState.falseCount;
        
        vscode.setState({ quoteState: quoteState, scoreState: newScoreState, guessedState: guessedState });
    }

    /**
     * Checks if the author of the current quote matches the input
     * @param {string} input - The input to match
     */
    function checkAuthor(input) {
        sendMessage({ type: 'testing', value: { input: input, answer: quoteState.author }})
        if(guessedState.guessed === true) return;

        if(input.toUpperCase() === quoteState.author.toUpperCase()) {
            scoreState.points += 10;
            scoreState.correctCount += 1;
            guessedState.guessed = true;
            inputElement.classList.add('highlight-green');
        } else {
            scoreState.points -= 5;
            scoreState.falseCount += 1;
            inputElement.classList.add('highlight-red');
        }
        updateScoreboard(scoreState);
    }

    /**
     * Updates the current quote
     * @param {{ content: string, author: string }} quote - The quote to change to
     */
    function updateQuote(quote) {
        const div = document.querySelector('.quote');
        
        if(!quote) {
            div.textContent = 'Failed to load quote.';
            return;
        }
        
        div.textContent = quote.content;
        guessedState.guessed = false;
        inputElement.value = ''

        quoteState.author = quote.author;
        quoteState.content = quote.content; 

        vscode.setState({ quoteState: quoteState, scoreState: scoreState, guessedState: guessedState });
    }

    /**
     * Sends a message to the extension
     * @param {{ type: string, value: any }} message - The message to send with type and value
     */
    function sendMessage(message) {
        vscode.postMessage(message);
    }

    /**
     * Shows the answer in the input element and subtracts points
     */
    function showAnswer() {
        inputElement.value = quoteState.author;
        guessedState.guessed = true;
        sendMessage({ type: 'testing', value: 'showing answer...'})
        checkAuthor("Herr Markst van Hinten");
    }

}());