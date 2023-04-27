export const getCaretPosition = (ref: any) => {
  if (!ref || !ref.current) {
    return 0;
  }
  const node = ref.current;
  return node.selectionStart;
};

export const setCaretPosition = (ref: any, position: number) => {
  if (!ref || !ref.current) {
    return false;
  }
  const node = ref.current;

  if (node.createTextRange) {
    const range = node.createTextRange();
    range.move('character', position);
    range.select();
  } else {
    if (node.selectionStart) {
      node.focus();
      node.setSelectionRange(position, position);
    } else {
      node.focus();
    }
  }
  return true;
};
