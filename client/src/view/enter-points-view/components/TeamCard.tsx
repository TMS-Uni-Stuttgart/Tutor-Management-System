import { Card, CardActions, CardContent, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { Team } from 'shared/dist/model/Team';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import SplitButton from './SplitButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    points: {
      marginTop: theme.spacing(1),
    },
    actions: {
      justifyContent: 'flex-end',
    },
  })
);

interface Props {
  team: Team;
}

function teamToString(team: Team): string {
  return `Team #${team.teamNo.toString().padStart(2, '0')}`;
}

function TeamCard({ team }: Props): JSX.Element {
  const classes = useStyles();

  const studentsInTeam: string =
    team.students.length > 0
      ? team.students.map(student => getNameOfEntity(student)).join(', ')
      : 'Keine Studierende in diesem Team.';

  return (
    <Card variant='outlined'>
      <CardContent>
        <Typography gutterBottom variant='h5' component='h2'>
          {teamToString(team)}
        </Typography>

        <Typography>{studentsInTeam}</Typography>

        <div className={classes.points}>[[Punkte für ÜB und Aufgaben]]</div>
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
