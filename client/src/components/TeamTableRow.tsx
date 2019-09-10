import { TableCell, Theme, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Group as GroupIcon } from '@material-ui/icons';
import React from 'react';
import { Team } from 'shared/dist/model/Team';
import ListItemMenu from './ListItemMenu';
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
  team: Team;
  onEditTeamClicked: (team: Team) => void;
  onDeleteTeamClicked: (team: Team) => void;
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
        subText={team.students.length === 0 ? 'Keine Mitglieder' : undefined}
        icon={GroupIcon}
        buttonCellContent={
          <ListItemMenu
            onEditClicked={() => onEditTeamClicked(team)}
            onDeleteClicked={() => onDeleteTeamClicked(team)}
          />
        }
      >
        <TableCell>
          <div className={classes.infoBlock}>
            {/* <Typography>Bestanden:</Typography>
            <Typography>ANZAHL</Typography> */}
            <Typography>
              {`Mitglieder: ${team.students
                .map(student => `${student.firstname} ${student.lastname}`)
                .join(', ')}`}
            </Typography>
          </div>
        </TableCell>
      </PaperTableRow>
    </>
  );
}

export default TeamTableRow;
