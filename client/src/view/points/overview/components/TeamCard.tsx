import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  Account as StudentIcon,
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
import { useDialog } from '../../../../hooks/DialogService';
import {
  getEnterPointsForTeamPath,
  getEnterPointsForStudentPath,
} from '../../../../util/routing/Routing.helpers';
import SplitButton from './SplitButton';
import TeamCardPointsTable from './TeamCardPointsTable';
import { renderLink } from '../../../../components/drawer/components/renderLink';

const useStyles = makeStyles(() =>
  createStyles({
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
  const dialog = useDialog();

  const studentsInTeam: string =
    team.students.length > 0
      ? team.students.map(student => getNameOfEntity(student)).join(', ')
      : 'Keine Studierende in diesem Team.';

  const handleEnterStudents = () => {
    dialog.show({
      DialogProps: {
        // This is important to be able to use the Link component of react-router.
        disablePortal: true,
      },
      title: 'Studierende(n) auswählen',
      content: (
        <List>
          {team.students.map((student, idx) => (
            <React.Fragment key={student.id}>
              <ListItem
                button
                onClick={() => dialog.hide()}
                component={renderLink(
                  getEnterPointsForStudentPath({
                    tutorialId,
                    sheetId: sheet.id,
                    studentId: student.id,
                  })
                )}
              >
                <ListItemIcon>
                  <StudentIcon />
                </ListItemIcon>

                <ListItemText
                  primary={getNameOfEntity(student)}
                  secondary='Zum Auswählen klicken'
                />
              </ListItem>
              {idx !== team.students.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ),
      actions: [
        {
          label: 'Abbrechen',
          onClick: dialog.hide,
        },
      ],
    });
  };

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
        <TeamCardPointsTable team={team} sheet={sheet} />
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
                to: getEnterPointsForTeamPath({ tutorialId, sheetId: sheet.id, teamId: team.id }),
              },
            },
            {
              label: 'Einzeln für Studierende',
              disabled: team.students.length === 0,
              ButtonProps: {
                onClick: handleEnterStudents,
              },
            },
          ]}
        />
      </CardActions>
    </Card>
  );
}

export default TeamCard;
