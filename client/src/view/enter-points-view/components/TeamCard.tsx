import { Card, CardActions, CardContent, CardHeader } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AccountMultiple as TeamIcon, FileFind as PdfPreviewIcon, PdfBox as PdfIcon } from 'mdi-material-ui';
import React from 'react';
import { Sheet } from 'shared/dist/model/Sheet';
import { Team } from 'shared/dist/model/Team';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import SplitButton from './SplitButton';
import TeamCardPointsTable from './TeamCardPointsTable';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    points: {}, // FIXME: REMOVE ME LATER!
    actions: {
      justifyContent: 'flex-end',
    },
  })
);

interface Props {
  team: Team;
  sheet: Sheet;
}

function teamToString(team: Team): string {
  return `Team #${team.teamNo.toString().padStart(2, '0')}`;
}

function TeamCard({ team, sheet }: Props): JSX.Element {
  const classes = useStyles();

  const studentsInTeam: string =
    team.students.length > 0
      ? team.students.map(student => getNameOfEntity(student)).join(', ')
      : 'Keine Studierende in diesem Team.';

  return (
    <Card variant='outlined'>
      <CardHeader
        avatar={<TeamIcon />}
        action={
          <EntityListItemMenu
            additionalItems={[
              {
                primary: 'PDF Vorschau',
                Icon: PdfPreviewIcon,
                onClick: () => {},
              },
              {
                primary: 'PDF herunterladen',
                Icon: PdfIcon,
                onClick: () => {},
              },
            ]}
          />
          // <IconButton>
          //   <MoreVertIcon />
          // </IconButton>
        }
        title={teamToString(team)}
        subheader={studentsInTeam}
      />

      <CardContent>
        <TeamCardPointsTable team={team} sheet={sheet} className={classes.points} />
      </CardContent>

      <CardActions className={classes.actions}>
        <SplitButton
          variant='outlined'
          color='default'
          options={[
            {
              label: 'Punkte eintragen',
              onClick: () => {
                // FIXME: IMPLEMENT ME
              },
            },
            {
              label: 'Einzeln für Studierende',
              onClick: () => {
                // FIXME: IMPLEMENT ME
              },
            },
          ]}
        />
      </CardActions>
    </Card>
  );
}

export default TeamCard;
