#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const { execa } = require('execa');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
    const { shouldAdd } = await inquirer.prompt([
      {
        type: 'list',
        name: 'shouldAdd',
        message: 'Adam CLI is not in your PATH. Add it now?',
        choices: [
          { name: 'Yes', value: true },
          { name: 'No', value: false }
        ],
        default: 0
      }
    ]);

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

    // Select stash
    const { selectedStash } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedStash',
        message: 'Select a stash:',
        choices: stashes.map(s => ({
          name: `${chalk.cyan(s.name)} - ${s.description}`,
          value: s.name
        })),
        pageSize: 10
      }
    ]);

    // Select action
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          { name: 'Apply (keep in stash list)', value: 'apply' },
          { name: 'Pop (remove from stash list)', value: 'pop' }
        ],
        default: 0
      }
    ]);

    // Execute action
    console.log(chalk.blue(`Running: git stash ${action} ${selectedStash}`));
    const result = await execa('git', ['stash', action, selectedStash], {
      cwd,
      stdio: 'inherit'
    });

    console.log(chalk.green(`✓ Successfully ${action === 'apply' ? 'applied' : 'popped'} ${selectedStash}`));

  } catch (error) {
    if (error.stderr) {
      console.error(chalk.red('Git error:'), error.stderr);
    } else {
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

program
  .command('git')
  .description('Git utilities')
  .command('stashes')
  .description('Interactive git stash manager')
  .action(async () => {
    await checkPathSetup();
    await handleStashes();
  });

// Parse with fallback for direct "adam git stashes" call
const args = process.argv.slice(2);
if (args.length === 2 && args[0] === 'git' && args[1] === 'stashes') {
  (async () => {
    await checkPathSetup();
    await handleStashes();
  })();
} else {
  program.parse(process.argv);
}
