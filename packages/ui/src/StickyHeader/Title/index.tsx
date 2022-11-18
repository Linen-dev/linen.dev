import React from 'react';
import styled from 'styled-components';

const Div = styled.div`
  align-items: center;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  gap: 0.25rem;
`;
interface Props {
  children: React.ReactNode;
}

export default function Title({ children }: Props) {
  return <Div>{children}</Div>;
}
