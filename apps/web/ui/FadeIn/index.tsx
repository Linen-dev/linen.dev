import classNames from 'classnames';
import React from 'react';
import { InView } from 'react-intersection-observer';
import styles from './index.module.scss';

type FadeDirection = 'up' | 'down' | 'left' | 'right';
type FadeDelay = 0 | 100 | 200 | 300 | 500 | 700 | 1000;

const getClassNamesByDirection = (direction: FadeDirection) => {
  switch (direction) {
    case 'right':
      return [styles._translateX4, styles.translateX0];
    case 'left':
      return [styles.translateX4, styles.translateX0];
    case 'down':
      return [styles._translateY4, styles.translateY0];
    case 'up':
    default:
      return [styles.translateY4, styles.translateY0];
  }
};

const getClassNameByDelay = (delay: FadeDelay) => {
  switch (delay) {
    case 100:
      return styles.delay100;
    case 200:
      return styles.delay200;
    case 300:
      return styles.delay300;
    case 500:
      return styles.delay500;
    case 700:
      return styles.delay700;
    case 1000:
      return styles.delay1000;
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
            className={classNames(delayClassName, styles.transform, {
              [styles.opacity100]: inView,
              [visible]: inView,
              [styles.opacity0]: !inView,
              [hidden]: !inView,
            })}
          >
            {children}
          </div>
        );
      }}
    </InView>
  );
};

export default FadeIn;
