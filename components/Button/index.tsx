import { FunctionComponent, ReactNode } from 'react';

interface Props {
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
  onClick?(): void;
}

const Button: FunctionComponent = ({ type, children, onClick }: Props) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
    >
      {children}
    </button>
  );
};

Button.defaultProps = {
  type: 'button',
};

export default Button;
