import React from 'react';
import styled, { css } from 'styled-components';
import Colors from '@linen/styles/colors';

interface Props {
  children: React.ReactNode;
  active?: boolean;
}

const Wrapper = styled.div`
  align-items: center;
  color: ${Colors.Gray700};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  font-size: 0.875rem;
  gap: 0.25rem;
  line-height: 1.25rem;
  font-weight: 500;

  padding: 0.5rem;
  margin: 0.25rem 0;
  transition: 0.1s ease-in color, 0.1s ease-in background;

  &:hover {
    background: ${Colors.Gray50};
    color: ${Colors.Gray900};
  }

  ${({ active }: { active: boolean }) =>
    active &&
    css`
      background-color: rgb(243 244 246);
      color: ${Colors.Gray900};
      font-weight: 700;

      &:hover {
        background-color: rgb(243 244 246);
        color: ${Colors.Gray900};
        font-weight: 700;
      }
    `}

  @media screen and (max-width: 1024px) {
    border-radius: 0;
    margin: 0;
  }
` as any;

export default function Item({ children, active }: Props) {
  return <Wrapper active={active}>{children}</Wrapper>;
}
