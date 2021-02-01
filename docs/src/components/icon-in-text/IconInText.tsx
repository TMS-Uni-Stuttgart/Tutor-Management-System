import clsx from 'clsx';
import React from 'react';
import styles from './styles.module.css';

interface Props {
    icon: () => JSX.Element;
    small?: boolean;
}

function IconInText({ icon: Icon, small }: Props): JSX.Element {
    return (
        <span className={clsx(styles.wrapper, small && styles['wrapper-small'])}>
            <Icon />
        </span>
    );
}

export default IconInText;
