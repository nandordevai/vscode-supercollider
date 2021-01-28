const vscode = require('vscode');

let activeTerminal = null;
vscode.window.onDidCloseTerminal((terminal) => {
    if (terminal.name === 'SuperCollider') {
        if (!terminal.tckDisposed) {
            disposeTerminal();
        }
    }
});

function createTerminal() {
    activeTerminal = vscode.window.createTerminal('SuperCollider');
    return activeTerminal;
}

function disposeTerminal() {
    activeTerminal.tckDisposed = true;
    activeTerminal.dispose();
    activeTerminal = null;
}

function getTerminal() {
    if (!activeTerminal) {
        createTerminal();
    }

    return activeTerminal;
}

function resolve(editor, command) {
    const scPath = vscode.workspace.getConfiguration().get('supercollider.sclangCmd');
    return command
        .replace(/\${file}/g, `"${editor.document.fileName}"`)
        .replace(/\${sclangCmd}/g, scPath);
}

function run(command) {
    const terminal = getTerminal();
    terminal.show(true);
    vscode.commands.executeCommand('workbench.action.terminal.scrollToBottom');
    terminal.sendText(command, true);
}

function warn(msg) {
    console.log('supercollider.execInTerminal: ', msg);
}

function handleInput(editor) {
    vscode.workspace.saveAll(false);
    const command = '${sclangCmd} ${file}';
    const cmd = resolve(editor, command);
    run(cmd);
}

function activate(context) {
    const execInTerminal = vscode.commands.registerCommand('supercollider.execInTerminal', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            handleInput(editor);
        } else {
            warn('no active editor');
        }
    });
    context.subscriptions.push(execInTerminal);

    const killTerminal = vscode.commands.registerCommand('supercollider.killTerminal', () => {
        if (activeTerminal) {
            disposeTerminal();
        }
    });
    context.subscriptions.push(killTerminal);
}

function deactivate() {
    disposeTerminal();
}

exports.activate = activate;
exports.deactivate = deactivate;
