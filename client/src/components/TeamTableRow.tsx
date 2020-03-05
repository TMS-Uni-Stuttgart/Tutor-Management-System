import { TableCell, Theme, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { AccountMultiple as GroupIcon } from 'mdi-material-ui';
import React from 'react';
import { ITeam } from 'shared/model/Team';
import EntityListItemMenu from './list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from './PaperTableRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    infoBlock: {
      display: 'grid',
      gridRowGap: theme.spacing(1),
      gridColumnGap: theme.spacing(2),
      gridTemplateColumns: 'max-content 1fr',
    },
  })
);

interface Props extends PaperTableRowProps {
  team: ITeam;
  onEditTeamClicked: (team: ITeam) => void;
  onDeleteTeamClicked: (team: ITeam) => void;
}

function TeamTableRow({
  team,
  onEditTeamClicked,
  onDeleteTeamClicked,
  ...rest
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <>
      <PaperTableRow
        {...rest}
        label={`Team #${team.teamNo.toString().padStart(2, '0')}`}
        icon={GroupIcon}
        buttonCellContent={
          <EntityListItemMenu
            onEditClicked={() => onEditTeamClicked(team)}
            onDeleteClicked={() => onDeleteTeamClicked(team)}
          />
        }
      >
        <TableCell>
          <div className={classes.infoBlock}>
            <Typography>
              {team.students.length > 0
                ? `Mitglieder: ${team.students
                    .map(student => `${student.firstname} ${student.lastname}`)
                    .join(', ')}`
                : 'Keine Mitglieder.'}
            </Typography>
          </div>
        </TableCell>
      </PaperTableRow>
    </>
  );
}

export default TeamTableRow;
