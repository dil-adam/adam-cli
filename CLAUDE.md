# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal CLI tool collection for developer productivity. Built as an ESM Node.js application using Commander.js for CLI structure and Inquirer.js for interactive prompts.

**Binary name**: `adam` (configured in package.json bin field)

## Development Commands

```bash
# Install dependencies
npm install

# Run the CLI locally
./index.js git stashes

# Test installation by running from anywhere (after PATH setup)
adam git stashes
```

Note: There are no tests configured yet (npm test is a stub).

## Architecture

**Single-file architecture**: The entire application is in `index.js` as a monolithic CLI.

**Command structure**:
- Uses Commander.js with nested command groups
- Pattern: `adam <command-group> <subcommand>`
- Currently implemented: `adam git stashes`

**Key features**:
- **Auto PATH setup**: First run checks if CLI is in PATH and offers to add it to shell profile (~/.zshrc on macOS, ~/.bashrc on Linux)
- **Interactive prompts**: Uses Inquirer.js for list-based selection with arrow keys
- **Git integration**: Uses execa to spawn git subprocesses, operates in current working directory

## Adding New Commands

When extending this CLI:

1. **Command group pattern**: Create or extend command groups using `program.command('group').description('...')`
2. **Subcommands**: Chain `.command('subcommand')` on the group
3. **PATH check**: Include `await checkPathSetup()` in action handlers for first-run experience
4. **Git operations**: Always check for git repository first using `git rev-parse --git-dir`
5. **User feedback**: Use chalk for colored output (green for success, yellow for warnings, red for errors, blue for info, cyan for highlights)

## Code Style

- ESM modules (`type: "module"` in package.json)
- Use `import` syntax
- Async/await for all asynchronous operations
- Inquirer prompts: Using `@inquirer/prompts` (v13+) and `@inquirer/core` for custom prompts
- Error handling: catch blocks log to stderr and exit(1)

## Custom Prompts

The stash manager uses a custom prompt (`stash-select.js`) built with `@inquirer/core`:
- **IMPORTANT**: `@inquirer/core`'s `useState` does NOT support updater functions
  - ❌ Wrong: `setState((prev) => prev + 1)` - stores the function itself!
  - ✅ Correct: `const newVal = state + 1; setState(newVal);`
- Uses manual pagination to show 10 items at a time
- Backspace key handling for delete functionality
- Features: arrow navigation, backspace-to-delete, escape-to-cancel
