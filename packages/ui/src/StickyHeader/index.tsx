import React from 'react';
import styled from 'styled-components';
import Colors from '@linen/styles/colors';
import Title from './Title';
import Subtitle from './Subtitle';

interface Props {
  className?: string;
  children: React.ReactNode;
}

const Header = styled.div`
  background: ${Colors.White};
  border-bottom: 1px solid ${Colors.Gray200};
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 1;
`;

function StickyHeader({ className, children }: Props) {
  return <Header className={className}>{children}</Header>;
}

StickyHeader.Title = Title;
StickyHeader.Subtitle = Subtitle;

export default StickyHeader;
