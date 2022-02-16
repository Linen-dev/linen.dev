function TableHeader({ children, style, ...rest }) {
  return (
    <th style={{ padding: '20px', ...style }} {...rest}>
      {children}
    </th>
  );
}

export default TableHeader;
