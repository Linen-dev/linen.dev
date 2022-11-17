import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
}

const Wrapper = styled.ul`
  list-style: disc;
  margin-left: 1rem;
`;

export default function List({ children }: Props) {
  return <Wrapper>{children}</Wrapper>;
}

export { List };
