import * as React from 'react';

const ImageMock = (props: {
  children: React.ReactElement;
}): React.ReactElement => {
  return <>{props.children}</>;
};

export default ImageMock;
