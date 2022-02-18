function TableHeader({
  children,
  style,
  ...rest
}: {
  children?: any | null;
  style?: any | null;
}) {
  return (
    <th style={{ padding: '20px', ...style }} {...rest}>
      {children}
    </th>
  );
}

export default TableHeader;
