// PostToolUse(Write|Edit): run prettier on edited .ts files.
const { execFileSync } = require('node:child_process');
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let file = '';
  try {
    const p = JSON.parse(raw);
    file = p.tool_input?.file_path ?? p.tool_response?.filePath ?? '';
  } catch {
    process.exit(0);
  }
  if (!/\.ts$/.test(file)) process.exit(0);
  try {
    // Resolve the project's prettier and run it via node directly — no shell,
    // so paths with spaces ("butter byte") need no quoting.
    const bin = require.resolve('prettier/bin/prettier.cjs', {
      paths: [process.cwd()],
    });
    execFileSync(process.execPath, [bin, '--write', file], {
      stdio: 'ignore',
      timeout: 25000,
    });
  } catch {
    // never fail the edit because formatting failed
  }
});
