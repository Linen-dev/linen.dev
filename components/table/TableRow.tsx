import Link from 'next/link';

function TableRow({ children, key = '', href }) {
  const row = (
    <tr
      style={{
        cursor: href ? 'pointer' : 'auto',
      }}
      key={href ? '' : key}
    >
      {children}
    </tr>
  );
  if (href) {
    return (
      <Link href={href} key={key} passHref>
        {row}
      </Link>
    );
  }
  return row;
}

export default TableRow;
