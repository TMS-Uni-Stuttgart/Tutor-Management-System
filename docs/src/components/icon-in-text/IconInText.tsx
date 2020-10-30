import React from 'react';
import styles from './styles.module.css';

interface Props {
  icon: () => JSX.Element;
}

function IconInText({ icon: Icon }: Props): JSX.Element {
  return (
    <span className={styles.wrapper}>
      <Icon />
    </span>
  );
}

export default IconInText;
