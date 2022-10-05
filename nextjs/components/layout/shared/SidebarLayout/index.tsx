import React from 'react';
import { Transition } from '@headlessui/react';
import useDevice from 'hooks/device';

interface Props {
  left: React.ReactNode;
  right?: React.ReactNode;
  leftRef?: any;
  rightRef?: any;
  onLeftScroll?(): void;
  onRightScroll?(): void;
}

function SidebarLayout({
  left,
  right,
  leftRef,
  rightRef,
  onLeftScroll,
  onRightScroll,
}: Props) {
  const { isMobile } = useDevice();
  return (
    <>
      <Transition
        show={isMobile && !!right ? false : true}
        className={
          'flex-col overflow-auto lg:h-[calc(100vh_-_64px)] md:h-[calc(100vh_-_144px)] h-[calc(100vh_-_152px)] lg:w-[calc(100vw_-_250px)] flex justify-left w-[100vw] relative'
        }
        onScroll={onLeftScroll}
        ref={leftRef}
      >
        {left}
      </Transition>
      <Transition
        show={!!right}
        className={
          'flex flex-col border-l border-solid border-gray-200 md:w-[700px]'
        }
      >
        {right && (
          <div
            className="overflow-auto flex flex-col relative"
            onScroll={onRightScroll}
            ref={rightRef}
          >
            {right}
          </div>
        )}
      </Transition>
    </>
  );
}

export default SidebarLayout;
