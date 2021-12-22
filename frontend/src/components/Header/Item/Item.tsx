import React, { useState } from 'react';

export default function HeaderItem(props: any) {
  const [id, setId] = useState('default');

  const {
    headerLabel,
    setSelectedContent,
  } = props;

  return (
    <button
      type="button"
      id={id}
      onClick={() => { setSelectedContent(headerLabel); }}
      onMouseEnter={() => { setId('mouseHover'); }}
      onMouseLeave={() => { setId('default'); }}
    >
      {headerLabel}
    </button>
  );
}
