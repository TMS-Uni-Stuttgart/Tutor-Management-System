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
    labelCell: {
      // Style cell of name to not take up more space than neccessary
      width: '1%',
      whiteSpace: 'nowrap',
    },
    tutorialChip: {
      margin: theme.spacing(0.5),
    },
  })
);

interface Props extends PaperTableRowProps {
  user: IUser;
  disableSendCredentials?: boolean;
  disableDelete?: boolean;
  onEditUserClicked: (user: IUser) => void;
  onDeleteUserClicked: (user: IUser) => void;
  onSendCredentialsClicked: (user: IUser) => void;
}

function getRolesAsString(roles: Role[]): string {
  return roles.join(', ');
}

function UserTableRow({
  user,
  disableSendCredentials,
  disableDelete,
  onEditUserClicked,
  onDeleteUserClicked,
  onSendCredentialsClicked,
  ...rest
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <PaperTableRow
      label={`${user.lastname}, ${user.firstname}`}
      subText={`Nutzername: ${user.username}, Rollen: ${getRolesAsString(user.roles)}`}
      icon={PersonIcon}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEditUserClicked(user)}
          onDeleteClicked={() => onDeleteUserClicked(user)}
          disableDelete={disableDelete}
          additionalItems={[
            {
              primary: 'Zugangsdaten schicken',
              secondary:
                (disableSendCredentials && 'Vom Server nicht unterstützt.') ||
                (!user.email && 'Nutzer/in hat keine E-Mail') ||
                (!user.temporaryPassword && 'Nutzer/in hat kein temporäres Passwort.') ||
                undefined,
              onClick: () => onSendCredentialsClicked(user),
              Icon: MailIcon,
              disabled: disableSendCredentials || !user.email || !user.temporaryPassword,
            },
          ]}
        />
      }
      LabelCellProps={{ className: classes.labelCell }}
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
                size={user.tutorials.length > 0 ? 'small' : 'medium'}
              />
            ))}
          </div>
        )}
      </TableCell>
    </PaperTableRow>
  );
}

export default UserTableRow;
