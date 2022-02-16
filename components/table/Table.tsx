import { Table as MantineTable } from '@mantine/core';

function Table({ children, clickable }) {
  return (
    <MantineTable
      highlightOnHover={clickable}
      verticalSpacing="xl"
      horizontalSpacing="lg"
    >
      {children}
    </MantineTable>
  );
}

export default Table;
