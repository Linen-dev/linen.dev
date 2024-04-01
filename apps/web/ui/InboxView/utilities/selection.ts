import { Selections } from '@linen/types';

function getCheckedSelections(selections: Selections): Selections {
  const result: Selections = {};
  for (const key in selections) {
    const selection = selections[key];
    if (selection.checked) {
      result[key] = { ...selection };
    }
  }
  return result;
}

function getIndexes(
  selections: Selections,
  current: number
): {
  lowest: number;
  highest: number;
  current: number;
} {
  const keys = Object.keys(selections);
  const length = keys.length;
  if (length === 0) {
    return {
      lowest: 0,
      highest: 0,
      current,
    };
  }
  const indexes = [];
  for (const key in selections) {
    const selection = selections[key];
    indexes.push(selection.index);
  }
  return {
    lowest: Math.min.apply(Math, indexes),
    highest: Math.max.apply(Math, indexes),
    current,
  };
}

export function manageSelections({
  id,
  checked,
  index,
  selections,
  ids,
  isShiftPressed,
}: {
  id: string;
  checked: boolean;
  index: number;
  selections: Selections;
  ids: string[];
  isShiftPressed: boolean;
}): Selections {
  selections = getCheckedSelections(selections);
  if (isShiftPressed) {
    let { lowest, highest, current } = getIndexes(selections, index);

    if (lowest < current && highest > current) {
      return selections;
    } else if (lowest < current) {
      const result: Selections = {};
      for (let i = lowest, ilen = current; i <= ilen; i++) {
        const id = ids[i];
        result[id] = { checked, index: i };
      }
      return result;
    } else if (highest > current) {
      const result: Selections = {};
      for (let i = current, ilen = highest; i <= ilen; i++) {
        const id = ids[i];
        result[id] = { checked, index: i };
      }
      return result;
    }
    return selections;
  }

  const result: Selections = {};
  if (checked) {
    result[id] = { checked, index };
  }
  for (const key in selections) {
    if (key !== id) {
      const selection = selections[key];
      if (selection.checked) {
        result[key] = { ...selections[key] };
      }
    }
  }
  return result;
}
