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
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  Account as StudentIcon,
  AccountMultiple as TeamIcon,
  FileFind as PdfPreviewIcon,
  PdfBox as PdfIcon,
} from 'mdi-material-ui';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getNameOfEntity } from 'shared/util/helpers';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import PointsTable from '../../../../components/points-table/PointsTable';
import SplitButton from '../../../../components/SplitButton';
import { useDialog } from '../../../../hooks/DialogService';
import { Sheet } from '../../../../model/Sheet';
import { Team } from '../../../../model/Team';
import { ROUTES } from '../../../../routes/Routing.routes';

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      flex: 1,
    },
    actions: {
      marginTop: 'auto',
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
  return `Team #${team.getTeamNoAsString()}`;
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
      ? team.students
          .map((student) => getNameOfEntity(student, { firstNameFirst: true }))
          .join(', ')
      : 'Keine Studierende in diesem Team.';
  const teamGrading = useMemo(() => team.getGrading(sheet), [team, sheet]);
  const placeholderText = useMemo(
    () =>
      team.getAllGradings(sheet).length === 0
        ? 'Keine Bewertung für das Team vorhanden.'
        : 'Studierende haben unterschiedliche Bewertungen.',
    [team, sheet]
  );

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
                component={ROUTES.ENTER_POINTS_STUDENT.renderLink({
                  tutorialId,
                  sheetId: sheet.id,
                  teamId: team.id,
                  studentId: student.id,
                })}
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
    <Card variant='outlined' className={classes.card}>
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

      <CardContent className={classes.content}>
        {teamGrading ? (
          <PointsTable grading={teamGrading} sheet={sheet} />
        ) : (
          <Typography align='center'>{placeholderText}</Typography>
        )}
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
                to: ROUTES.ENTER_POINTS_TEAM.create({
                  tutorialId,
                  sheetId: sheet.id,
                  teamId: team.id,
                }),
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
