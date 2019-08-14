import { Chip, TableCell } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Person as PersonIcon } from '@material-ui/icons';
import React from 'react';
import ListItemMenu from '../../../components/ListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { Role } from '../../../typings/ServerResponses';
import { UserWithFetchedTutorials } from '../../../typings/types';

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
}

function getRolesAsString(roles: Role[]): string {
  return roles.join(', ');
}

function UserTableRow({
  user,
  onEditUserClicked,
  onDeleteUserClicked,
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
        />
      }
      {...rest}
    >
      <TableCell>
        {user.tutorials.map(tutorial => (
          <Chip
            key={tutorial.id}
            label={`Tutorium #${tutorial.slot}`}
            className={classes.tutorialChip}
            color='default'
          />
        ))}
      </TableCell>
    </PaperTableRow>
  );
}

export default UserTableRow;
