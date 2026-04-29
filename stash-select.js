import {
  createPrompt,
  useState,
  useKeypress,
  usePrefix,
  isEnterKey,
  isUpKey,
  isDownKey,
} from '@inquirer/core';
import chalk from 'chalk';
import figures from '@inquirer/figures';

export default createPrompt((config, done) => {
  const { choices } = config;
  const pageSize = config.pageSize || 10;
  const [status, setStatus] = useState('pending');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [deleteMarked, setDeleteMarked] = useState(new Set());
  const prefix = usePrefix({ status });

  useKeypress((key, rl) => {
    if (isEnterKey(key)) {
      const selected = choices[cursorPosition];
      if (deleteMarked.has(selected.value)) {
        // Actually delete
        setStatus('done');
        done({ action: 'delete', stash: selected.value });
      } else {
        // Normal selection
        setStatus('done');
        done({ action: 'select', stash: selected.value });
      }
    } else if (isUpKey(key)) {
      const newPos = cursorPosition > 0 ? cursorPosition - 1 : choices.length - 1;
      setCursorPosition(newPos);
    } else if (isDownKey(key)) {
      const newPos = cursorPosition < choices.length - 1 ? cursorPosition + 1 : 0;
      setCursorPosition(newPos);
    } else if (key.name === 'backspace') {
      const selected = choices[cursorPosition];
      if (deleteMarked.has(selected.value)) {
        // Second backspace - actually delete
        setStatus('done');
        done({ action: 'delete', stash: selected.value });
      } else {
        // First backspace - mark for deletion
        const newMarked = new Set(deleteMarked);
        newMarked.add(selected.value);
        setDeleteMarked(newMarked);
      }
    } else if (key.name === 'escape') {
      // Cancel deletion mark
      setDeleteMarked(new Set());
    }
  });

  const message = chalk.bold(config.message);

  if (status === 'done') {
    return `${prefix} ${message}`;
  }

  // Defensive check
  if (!choices || choices.length === 0) {
    return `${prefix} ${message}\n${chalk.red('No choices available')}`;
  }

  // Manual pagination logic
  const startIndex = Math.max(0, Math.min(cursorPosition - Math.floor(pageSize / 2), choices.length - pageSize));
  const endIndex = Math.min(choices.length, startIndex + pageSize);
  const visibleChoices = choices.slice(startIndex, endIndex);

  // Render visible choices
  const choicesLines = [];
  for (let i = 0; i < visibleChoices.length; i++) {
    const choice = visibleChoices[i];
    const actualIndex = startIndex + i;
    const isSelected = actualIndex === cursorPosition;
    const isMarked = deleteMarked.has(choice.value);

    let line = isSelected ? figures.pointer : ' ';

    if (isMarked) {
      line += ' ' + chalk.red(choice.name + ' (hit backspace again to delete)');
    } else {
      line += ' ' + choice.name;
    }

    choicesLines.push(line);
  }

  const choicesStr = choicesLines.join('\n');

  const helpTip = chalk.dim('(Use arrow keys, backspace to delete, enter to select)');

  return `${prefix} ${message}\n${choicesStr}\n${helpTip}`;
});
