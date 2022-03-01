import Link from 'next/link';

function TableRow({ children, href }) {
  const row = (
    <tr
      style={{
        cursor: href ? 'pointer' : 'auto',
      }}
    >
      {children}
    </tr>
  );
  if (href) {
    return (
      <Link href={href} passHref>
        {row}
      </Link>
    );
  }
  return row;
}

export default TableRow;
