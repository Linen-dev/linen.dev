import React from 'react';
import StickyHeader from '../../../StickyHeader';
import { FiRss } from 'react-icons/fi';

export default function Header() {
  return (
    <StickyHeader>
      <StickyHeader.Title>
        <FiRss /> Feed
      </StickyHeader.Title>
      <StickyHeader.Subtitle>
        All of your channel conversations in one place
      </StickyHeader.Subtitle>
    </StickyHeader>
  );
}
