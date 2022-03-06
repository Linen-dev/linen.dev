function TableElement({ children, style, ...rest }) {
  return <td {...rest}>{children}</td>;
}

export default TableElement;
