const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
 console.log('Gumball extension activated');
 // 🔐 Enable Settings Sync for this key
 context.globalState.setKeysForSync(['gumball.commands']);
 const disposable = vscode.commands.registerCommand('gumball.open', () => {
  const panel = vscode.window.createWebviewPanel(
   'gumball',
   'Gumball',
   vscode.ViewColumn.One,
   {
    enableScripts: true
   }
  );
  // Webview resources
  const styleUri = panel.webview.asWebviewUri(
   vscode.Uri.file(path.join(context.extensionPath, 'dist/webview/style.css'))
  );
  const scriptUri = panel.webview.asWebviewUri(
   vscode.Uri.file(path.join(context.extensionPath, 'dist/webview/script.js'))
  );
  let html = fs.readFileSync(
   path.join(context.extensionPath, 'dist/webview/index.html'),
   'utf-8'
  );
  const nonce = getNonce();
  html = html.replace(
   '</head>',
   `
   <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
    style-src ${panel.webview.cspSource};
    script-src 'nonce-${nonce}';">
   <link href="${styleUri}" rel="stylesheet">
   </head>`
  );
  html = html.replace(
   '</body>',
   `<script nonce="${nonce}" src="${scriptUri}"></script></body>`
  );
  panel.webview.html = html;
  /* ===============================
     📨 Webview Message Handling
     =============================== */
  panel.webview.onDidReceiveMessage(
   message => {
    switch (message.command) {
     // 📥 Load stored commands
     case 'load': {
      const saved = context.globalState.get('gumball.commands', []);
      panel.webview.postMessage({
       command: 'load',
       data: saved
      });
      break;
     }
     // 💾 Save commands
     case 'save': {
      context.globalState.update('gumball.commands', message.data);
      vscode.window.showInformationMessage(`Saving....!`);
      break;
     }
     // ▶ Run command (for now just notify)
     case 'run': {
      vscode.window.showInformationMessage(`Running "${message.label}"`);
      // Create a terminal (or reuse one)
      const terminal = vscode.window.createTerminal({
       name: `Gumball: ${message.label}`,
       cwd: message.path // optional: working directory
      });
      terminal.show();
      terminal.sendText(message.cmd, true); // true = execute immediately
      break;
     }
     // ❌ Errors from webview
     case 'error': {
      vscode.window.showErrorMessage(message.text);
      break;
     }
    }
   },
   undefined,
   context.subscriptions
  );
 });
 context.subscriptions.push(disposable);
}

// 🔑 Nonce generator for CSP
function getNonce() {
 return Array.from({ length: 32 }, () =>
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   .charAt(Math.floor(Math.random() * 62))
 ).join('');
}

function deactivate() { }

module.exports = {
 activate,
 deactivate
};
