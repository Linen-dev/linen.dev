import Avatar from '@mantine/core';

function Avatar({ name, img }) {
  console.log('name, img :>> ', name, img);
  return <div>{name}</div>;
  // return <Avatar src={img} alt={name} />;
}

export default Avatar;
