import { Chip, TableCell } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Account as PersonIcon, Email as MailIcon } from 'mdi-material-ui';
import React from 'react';
import { Role } from 'shared/model/Role';
import { IUser } from 'shared/model/User';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { Tutorial } from '../../../model/Tutorial';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tutorialChip: {
      margin: theme.spacing(0.5),
    },
  })
);

interface Props extends PaperTableRowProps {
  user: IUser;
  onEditUserClicked: (user: IUser) => void;
  onDeleteUserClicked: (user: IUser) => void;
  onSendCredentialsClicked: (user: IUser) => void;
}

function getRolesAsString(roles: Role[]): string {
  return roles.join(', ');
}

function UserTableRow({
  user,
  onEditUserClicked,
  onDeleteUserClicked,
  onSendCredentialsClicked,
  ...rest
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <PaperTableRow
      label={`${user.lastname}, ${user.firstname}`}
      subText={getRolesAsString(user.roles)}
      icon={PersonIcon}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEditUserClicked(user)}
          onDeleteClicked={() => onDeleteUserClicked(user)}
          additionalItems={[
            {
              primary: 'Zugangsdaten schicken',
              onClick: () => onSendCredentialsClicked(user),
              Icon: MailIcon,
              disabled: !user.email,
            },
          ]}
        />
      }
      {...rest}
    >
      <TableCell>
        {user.tutorials.map((tutorial) => (
          <Chip
            key={tutorial.id}
            label={Tutorial.getDisplayString(tutorial)}
            className={classes.tutorialChip}
            color='primary'
          />
        ))}

        {user.tutorialsToCorrect.length > 0 && (
          <div>
            {user.tutorialsToCorrect.map((tutorial) => (
              <Chip
                key={tutorial.id}
                label={`Korrigiert: ${Tutorial.getDisplayString(tutorial)}`}
                className={classes.tutorialChip}
                color='default'
              />
            ))}
          </div>
        )}
      </TableCell>
    </PaperTableRow>
  );
}

export default UserTableRow;
