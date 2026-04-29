# Adam CLI

Personal CLI tools for better developer experience.

## Installation

1. Clone this repository
2. Run `npm install`
3. Run `./index.js git stashes` - it will prompt you to add the CLI to your PATH
4. Restart your terminal or run `source ~/.zshrc`
5. Use `adam git stashes` from anywhere

## Commands

### `adam git stashes`

Interactive git stash manager:
- Lists all available stashes in the current repository
- Use arrow keys to select a stash
- Choose to apply (keep in stash list) or pop (remove from stash list)

## Features

- ✅ Interactive selection with arrow keys
- ✅ Automatic PATH setup on first run
- ✅ Works from any git repository
- ✅ Color-coded output

## Requirements

- Node.js 18+
- Git
