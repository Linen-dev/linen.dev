import React from 'react';
import Message from 'components/Message';

interface Props {
  message: string;
}

export default function Preview({ message }: Props) {
  if (message) {
    return (
      <>
        <div className="mx-px mt-px px-3 pt-2 pb-12">
          <Message text={message} format="linen" />
        </div>
        <hr className="pb-2 w-full" />
      </>
    );
  }
  return (
    <>
      <div className="mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5 text-gray-800">
        Preview content will render here.
      </div>
      <hr className="pb-2 w-full" />
    </>
  );
}
