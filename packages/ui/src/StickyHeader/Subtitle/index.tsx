import React from 'react';
import styled from 'styled-components';
import Colors from '@linen/styles/colors';

const Div = styled.div`
  color: ${Colors.Gray700};
  font-size: 0.75rem;
  line-height: 1rem;
`;

interface Props {
  children: React.ReactNode;
}

export default function Subtitle({ children }: Props) {
  return <Div>{children}</Div>;
}
