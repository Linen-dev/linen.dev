import React from 'react';
import { Transition } from '@headlessui/react';
import useDevice from 'hooks/device';

interface Props {
  left: React.ReactNode;
  right?: React.ReactNode;
}

function SidebarLayout({ left, right }: Props) {
  const { isMobile } = useDevice();
  return (
    <>
      <Transition
        show={isMobile && !!right ? false : true}
        className={
          'flex-col overflow-auto lg:h-[calc(100vh_-_64px)] md:h-[calc(100vh_-_144px)] h-[calc(100vh_-_152px)] lg:w-[calc(100vw_-_250px)] flex justify-left w-[100vw] relative'
        }
      >
        {left}
      </Transition>
      <Transition
        show={!!right}
        className={
          'flex flex-col border-l border-solid border-gray-200 md:w-[700px]'
        }
      >
        {right}
      </Transition>
    </>
  );
}

export default SidebarLayout;
