// VS Code injects this at runtime
/* global acquireVsCodeApi */
const vscode = acquireVsCodeApi();

let commands = [];

const table = document.getElementById('command-table');
const labelInput = document.getElementById('label');
const cmdInput = document.getElementById('cmd');
const pathInput = document.getElementById('path');
const addBtn = document.getElementById('addBtn');

/* ---------- persistence ---------- */
function save() {
 vscode.postMessage({ command: 'save', data: commands });
}

// Request the initial data from the extension
vscode.postMessage({ command: 'load' });

// Listen for messages from the extension
window.addEventListener('message', event => {
 const message = event.data;
 if (message.command === 'load') {
  commands = message.data || [];
  render();
 }
});

/* ---------- render ---------- */
function render() {
 table.innerHTML = '';

 commands.forEach((c, i) => {
  const tr = document.createElement('tr');
  tr.className = 'hover:bg-green-900 transition';

  tr.innerHTML = `
   <td class="border border-green-300 px-3 py-1">${c.label}</td>
   <td class="border border-green-300 px-3 py-1 font-mono text-xs">${c.cmd}</td>
   <td class="border border-green-300 px-3 py-1">${c.path}</td>
   <td class="border border-green-300 px-3 py-1 flex gap-1">
    <button class="edit bg-blue-400">Edit</button>
    <button class="del bg-red-400">Delete</button>
    <button class="run bg-green-600">Run</button>
   </td>
  `;

  // Attach actions
  tr.querySelector('.edit').onclick = () => edit(i);
  tr.querySelector('.del').onclick = () => del(i);
  tr.querySelector('.run').onclick = () => run(i);

  // Add common button styles
  tr.querySelectorAll('button').forEach(b =>
   b.className += ' text-white px-2 py-1 rounded hover:opacity-90'
  );

  table.appendChild(tr);
 });
}

/* ---------- actions ---------- */
function add() {
 const label = labelInput.value.trim();
 const cmd = cmdInput.value.trim();
 const path = pathInput.value.trim();

 if (!label || !cmd || !path) {
  vscode.postMessage({ command: 'error', text: 'All fields are required.' });
  return;
 }

 commands.push({ label, cmd, path });
 labelInput.value = cmdInput.value = pathInput.value = '';
 save();
 render();
}

function edit(i) {
 const c = commands[i];
 labelInput.value = c.label;
 cmdInput.value = c.cmd;
 pathInput.value = c.path;
 commands.splice(i, 1);
 save();
 render();
}

function del(i) {
 commands.splice(i, 1);
 save();
 render();
}

// ✅ Fix: send label/cmd/path at top-level, not inside 'data'
function run(i) {
 const c = commands[i];
 if (!c) return;
 vscode.postMessage({
  command: 'run',
  label: c.label,
  cmd: c.cmd,
  path: c.path
 });
}

addBtn.onclick = add;

// Initial render in case commands were already loaded
render();
