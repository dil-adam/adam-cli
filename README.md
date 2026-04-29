# Adam CLI

Personal CLI tools for better developer experience.

## Installation

1. Clone this repository:
   ```bash
   cd ~/dev
   git clone https://github.com/dil-adam/adam-cli.git
   cd adam-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the CLI once to add it to your PATH:
   ```bash
   ./index.js git stashes
   ```
   It will prompt you to add the CLI to your PATH.

4. Restart your terminal or run:
   ```bash
   source ~/.zshrc
   ```

5. Now you can use `adam` from anywhere:
   ```bash
   adam git stashes
   ```

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
