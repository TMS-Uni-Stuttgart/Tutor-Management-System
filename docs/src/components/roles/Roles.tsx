import clsx from 'clsx';
import React, { useMemo } from 'react';
import styles from './styles.module.css';

interface Props {
  roles: string[];
}

function Roles({ roles: rolesFromProps }: Props): JSX.Element {
  const roles: string[] = useMemo(() => {
    return rolesFromProps
      .filter((role) => !!role)
      .map((role) => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase())
      .sort();
  }, [rolesFromProps]);

  return (
    <div className={styles.roleContainer}>
      <span className={styles.roleLabel}>Roles:</span>
      {roles.map((role) => (
        <span key={role} className={clsx('badge badge--primary', styles.role)}>
          {role}
        </span>
      ))}
    </div>
  );
}

export default Roles;
