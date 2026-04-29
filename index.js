#!/usr/bin/env node

import { program } from 'commander';
import { select } from '@inquirer/prompts';
import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import stashSelect from './stash-select.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if CLI is in PATH
async function isInPath() {
  const cliPath = path.resolve(__dirname, 'index.js');
  const pathDirs = process.env.PATH.split(':');
  const binDir = path.resolve(__dirname);

  return pathDirs.some(dir => dir === binDir);
}

// Add CLI to PATH
async function addToPath() {
  const shellProfile = os.platform() === 'darwin'
    ? path.join(os.homedir(), '.zshrc')
    : path.join(os.homedir(), '.bashrc');

  const cliDir = path.resolve(__dirname);
  const exportLine = `\n# Adam CLI\nexport PATH="$PATH:${cliDir}"\n`;

  try {
    const currentContent = fs.existsSync(shellProfile)
      ? fs.readFileSync(shellProfile, 'utf8')
      : '';

    if (!currentContent.includes(cliDir)) {
      fs.appendFileSync(shellProfile, exportLine);
      console.log(chalk.green(`✓ Added to PATH in ${shellProfile}`));
      console.log(chalk.yellow('Run: source ' + shellProfile + ' or restart your terminal'));
    } else {
      console.log(chalk.yellow('Already in PATH'));
    }
  } catch (error) {
    console.error(chalk.red('Failed to add to PATH:'), error.message);
  }
}

// Check PATH on first run
async function checkPathSetup() {
  if (!await isInPath()) {
    const shouldAdd = await select({
      message: 'Adam CLI is not in your PATH. Add it now?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false }
      ],
      default: true
    });

    if (shouldAdd) {
      await addToPath();
    }
  }
}

// Git stashes command
async function handleStashes() {
  try {
    // Get current directory
    const cwd = process.cwd();

    // Check if we're in a git repo
    try {
      await execa('git', ['rev-parse', '--git-dir'], { cwd });
    } catch (error) {
      console.error(chalk.red('Not a git repository'));
      process.exit(1);
    }

    // Main loop - keeps showing stashes until user is done
    while (true) {
      // List stashes
      const { stdout } = await execa('git', ['stash', 'list'], { cwd });

      if (!stdout) {
        console.log(chalk.yellow('No stashes found'));
        return;
      }

      const stashes = stdout.split('\n').map(line => {
        const match = line.match(/^(stash@\{\d+\}): (.+)$/);
        return match ? { name: match[1], description: match[2], full: line } : null;
      }).filter(Boolean);

      if (stashes.length === 0) {
        console.log(chalk.yellow('No stashes found'));
        return;
      }

      // Select stash with custom prompt that supports delete
      const result = await stashSelect({
        message: 'Select a stash:',
        choices: stashes.map(s => ({
          name: `${chalk.cyan(s.name)} - ${s.description}`,
          value: s.name
        })),
        pageSize: 10
      });

      // Handle delete action
      if (result.action === 'delete') {
        console.log(chalk.red(`Deleting ${result.stash}...`));
        await execa('git', ['stash', 'drop', result.stash], {
          cwd,
          stdio: 'inherit'
        });
        console.log(chalk.green(`✓ Successfully deleted ${result.stash}`));
        continue; // Refresh the list
      }

      // For normal selection, ask what to do
      const action = await select({
        message: 'What do you want to do?',
        choices: [
          { name: 'Apply (keep in stash list)', value: 'apply' },
          { name: 'Pop (remove from stash list)', value: 'pop' },
          { name: '← Back to stash list', value: 'back' },
          { name: 'Exit', value: 'exit' }
        ]
      });

      // Handle exit or back
      if (action === 'exit') {
        return;
      }

      if (action === 'back') {
        continue;
      }

      // Execute action
      console.log(chalk.blue(`Running: git stash ${action} ${result.stash}`));
      await execa('git', ['stash', action, result.stash], {
        cwd,
        stdio: 'inherit'
      });
      console.log(chalk.green(`✓ Successfully ${action === 'apply' ? 'applied' : 'popped'} ${result.stash}`));

      // After apply, ask if they want to continue
      if (action === 'apply') {
        const continueChoice = await select({
          message: 'Continue managing stashes?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false }
          ]
        });

        if (!continueChoice) {
          return;
        }
      }
      // After pop, automatically refresh the list
    }

  } catch (error) {
    if (error.stderr) {
      console.error(chalk.red('Git error:'), error.stderr);
    } else if (error.message && !error.message.includes('User force closed')) {
      console.error(chalk.red('Error:'), error.message);
    }
    process.exit(1);
  }
}

// Main program
program
  .name('adam')
  .description('Adam\'s CLI tools for better developer experience')
  .version('1.0.0');

// Git command group
const gitCommand = program
  .command('git')
  .description('Git utilities');

// Git stashes subcommand
gitCommand
  .command('stashes')
  .description('Interactive git stash manager')
  .action(async () => {
    await checkPathSetup();
    await handleStashes();
  });

program.parse(process.argv);
