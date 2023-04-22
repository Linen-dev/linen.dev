import React from 'react';
import { InView } from 'react-intersection-observer';

type FadeDirection = 'up' | 'down' | 'left' | 'right';
type FadeDelay = 0 | 100 | 200 | 300 | 500 | 700 | 1000;

const getClassNamesByDirection = (direction: FadeDirection) => {
  switch (direction) {
    case 'right':
      return ['-translate-x-4', 'translate-x-0'];
    case 'left':
      return ['translate-x-4', 'translate-x-0'];
    case 'down':
      return ['-translate-y-4', 'translate-y-0'];
    case 'up':
    default:
      return ['translate-y-4', 'translate-y-0'];
  }
};

const getClassNameByDelay = (delay: FadeDelay) => {
  switch (delay) {
    case 100:
      return 'delay-100';
    case 200:
      return 'delay-200';
    case 300:
      return 'delay-300';
    case 500:
      return 'delay-500';
    case 700:
      return 'delay-700';
    case 1000:
      return 'delay-1000';
    default:
      return '';
  }
};

const FadeIn = ({
  direction = 'up',
  delay = 0,
  once = true,
  children,
}: {
  direction?: FadeDirection;
  delay?: FadeDelay;
  once?: boolean;
  children: JSX.Element;
}) => {
  const [hidden, visible] = getClassNamesByDirection(direction);
  const delayClassName = getClassNameByDelay(delay);

  return (
    <InView triggerOnce={once}>
      {({ inView, ref, entry }) => {
        return (
          <div
            ref={ref}
            className={`transform transition-all ease-in-out duration-500 ${delayClassName} ${
              inView ? `opacity-100 ${visible}` : `opacity-0 ${hidden}`
            }`}
          >
            {children}
          </div>
        );
      }}
    </InView>
  );
};

export default FadeIn;
