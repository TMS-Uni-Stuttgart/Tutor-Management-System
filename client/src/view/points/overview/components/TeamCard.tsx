import { Card, CardActions, CardContent, CardHeader } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  AccountMultiple as TeamIcon,
  FileFind as PdfPreviewIcon,
  PdfBox as PdfIcon,
} from 'mdi-material-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { Sheet } from 'shared/dist/model/Sheet';
import { Team } from 'shared/dist/model/Team';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import SplitButton from './SplitButton';
import TeamCardPointsTable from './TeamCardPointsTable';
import { getEnterPointsFormPath } from '../../../../util/routing/Routing.helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    points: {}, // FIXME: REMOVE ME LATER!
    actions: {
      justifyContent: 'flex-end',
    },
  })
);

interface Props {
  tutorialId: string;
  team: Team;
  sheet: Sheet;
  onPdfPreviewClicked: (team: Team) => void;
  onGeneratePdfClicked: (team: Team) => void;
}

function teamToString(team: Team): string {
  return `Team #${team.teamNo.toString().padStart(2, '0')}`;
}

function TeamCard({
  tutorialId,
  team,
  sheet,
  onPdfPreviewClicked,
  onGeneratePdfClicked,
}: Props): JSX.Element {
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
                onClick: () => onPdfPreviewClicked(team),
              },
              {
                primary: 'PDF herunterladen',
                Icon: PdfIcon,
                onClick: () => onGeneratePdfClicked(team),
              },
            ]}
          />
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
              ButtonProps: {
                component: Link,
                to: getEnterPointsFormPath({ tutorialId, sheetId: sheet.id, teamId: team.id }),
              },
            },
            {
              label: 'Einzeln für Studierende',
            },
          ]}
        />
      </CardActions>
    </Card>
  );
}

export default TeamCard;
