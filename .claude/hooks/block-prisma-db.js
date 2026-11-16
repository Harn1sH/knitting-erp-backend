// PreToolUse(Bash): deny Prisma commands that apply changes to the database.
// The local .env DATABASE_URL points at PROD — see CLAUDE.md.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let cmd = '';
  try {
    cmd = JSON.parse(raw).tool_input?.command ?? '';
  } catch {
    process.exit(0);
  }
  if (!/\bprisma\b/.test(cmd)) process.exit(0);

  const dangerous =
    /\bmigrate\s+(deploy|reset|resolve)\b/.test(cmd) ||
    (/\bmigrate\s+dev\b/.test(cmd) && !/--create-only\b/.test(cmd)) ||
    /\bdb\s+(push|execute|seed)\b/.test(cmd);
  if (!dangerous) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Blocked: this Prisma command writes to the database and .env DATABASE_URL may be PROD. Use `prisma migrate dev --create-only` and hand the apply step to the user (see /schema-change).',
      },
    }),
  );
});
