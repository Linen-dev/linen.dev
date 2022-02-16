function TableElement({ children, style, ...rest }) {
  return (
    <td {...rest} style={{ verticalAlign: 'middle', ...style }}>
      {children}
    </td>
  );
}

export default TableElement;
