import React from 'react';
import ReactSwitch from 'react-switch';

interface Props {
  checked: boolean;
  onChange(checked: boolean): void;
}

export default function Toggle({ checked, onChange }: Props) {
  return (
    <ReactSwitch
      checked={checked}
      onChange={onChange}
      onColor="#1149e0"
      offColor="#e5e7eb"
      onHandleColor="#ffffff"
      offHandleColor="#ffffff"
      activeBoxShadow="0 0 1px 0 #1149e0"
      checkedIcon={false}
      uncheckedIcon={false}
      height={24}
      width={44}
      handleDiameter={20}
    />
  );
}
