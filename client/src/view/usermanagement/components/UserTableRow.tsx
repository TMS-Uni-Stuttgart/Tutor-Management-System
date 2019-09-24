import { Chip, TableCell } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Person as PersonIcon, ContactMail as MailIcon } from '@material-ui/icons';
import React from 'react';
import { Role } from 'shared/dist/model/Role';
import ListItemMenu from '../../../components/ListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { UserWithFetchedTutorials } from '../../../typings/types';
import { getDisplayStringForTutorial } from '../../../util/helperFunctions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tutorialChip: {
      margin: theme.spacing(0.5),
    },
  })
);

interface Props extends PaperTableRowProps {
  user: UserWithFetchedTutorials;
  onEditUserClicked: (user: UserWithFetchedTutorials) => void;
  onDeleteUserClicked: (user: UserWithFetchedTutorials) => void;
  onSendCredentialsClicked: (user: UserWithFetchedTutorials) => void;
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
        <ListItemMenu
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
        {user.tutorials.map(tutorial => (
          <Chip
            key={tutorial.id}
            label={getDisplayStringForTutorial(tutorial)}
            className={classes.tutorialChip}
            color='default'
          />
        ))}
      </TableCell>
    </PaperTableRow>
  );
}

export default UserTableRow;
