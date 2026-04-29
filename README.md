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

Interactive git stash manager with powerful features:

**Navigation:**
- ↑↓ arrow keys to navigate through stashes
- Pagination: shows 10 stashes at a time, scrolls automatically
- Wraps around (bottom to top, top to bottom)

**Actions:**
- **Enter**: Select a stash to apply or pop
- **Backspace once**: Mark stash for deletion (turns red)
- **Backspace twice**: Permanently delete the stash (`git stash drop`)
- **Escape**: Cancel deletion marking

**Workflow:**
1. Select a stash (or delete it with backspace)
2. Choose action: Apply (keep) or Pop (remove) or go Back
3. After pop/delete, list automatically refreshes
4. After apply, choose to continue or exit

## Features

- ✅ Interactive selection with arrow keys
- ✅ Pagination (10 items per page)
- ✅ Quick delete with backspace (two-step confirmation)
- ✅ Automatic list refresh after changes
- ✅ Automatic PATH setup on first run
- ✅ Works from any git repository
- ✅ Color-coded output (cyan for stashes, red for delete warnings)

## Technical Details

- Built with ES modules (Node.js 18+)
- Uses `@inquirer/prompts` and `@inquirer/core` for interactive UI
- Custom prompt implementation in `stash-select.js`
- Dependencies: commander, chalk, execa, inquirer

## Requirements

- Node.js 18+
- Git

## Development

See [CLAUDE.md](CLAUDE.md) for architecture details and development guidelines.
