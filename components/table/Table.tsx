import { Table as MantineTable } from '@mantine/core';

function Table({ children, clickable }) {
  return (
    <table
      className="min-w-full divide-y divide-gray-200"
      // highlightOnHover={clickable}
      // verticalSpacing="xl"
      // horizontalSpacing="lg"
    >
      {children}
    </table>
  );
}

export default Table;
