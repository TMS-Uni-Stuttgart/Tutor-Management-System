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
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {
  FilePdfBox as PdfIcon,
  FileFind as PdfPreviewIcon,
  Account as StudentIcon,
  AccountMultiple as TeamIcon,
} from 'mdi-material-ui';
import React, { useMemo } from 'react';
import { Link, useMatches } from 'react-router-dom';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import PointsTable from '../../../../components/points-table/PointsTable';
import SplitButton from '../../../../components/SplitButton';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import { GradingList } from '../../../../model/GradingList';
import { Sheet } from '../../../../model/Sheet';
import { Team } from '../../../../model/Team';
import { ROUTES, useTutorialRoutes } from '../../../../routes/Routing.routes';
import { renderLink } from '../../../../components/navigation-rail/components/renderLink';

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
  gradings: GradingList;
  onPdfPreviewClicked: (team: Team) => void;
  onGeneratePdfClicked: (team: Team) => void;
}

function TeamCard({
  tutorialId,
  team,
  sheet,
  gradings,
  onPdfPreviewClicked,
  onGeneratePdfClicked,
}: Props): JSX.Element {
  const classes = useStyles();
  const dialog = useDialog();
  const matches = useMatches();

  const { teamGrading, onlyIndividualEntriesAllowed } = useMemo(() => {
    const teamGradings = gradings.getAllOfTeam(team);
    const teamGrading = gradings.getOfTeam(team);

    const onlyIndividualEntriesAllowed: boolean = !teamGrading && teamGradings.length !== 0;

    return { teamGrading, onlyIndividualEntriesAllowed };
  }, [team, gradings]);

  const studentsInTeam: string =
    team.students.length > 0
      ? team.students.map((student) => student.nameFirstnameFirst).join(', ')
      : 'Keine Studierende in diesem Team.';

  const { placeholderText, pdfDisabled } = useMemo(() => {
    const gradingCount = gradings.getAllOfTeam(team).length;
    const placeholderText =
      gradingCount === 0
        ? 'Keine Bewertung für das Team vorhanden.'
        : 'Studierende haben unterschiedliche Bewertungen.';
    const pdfDisabled = gradingCount === 0;

    return { placeholderText, pdfDisabled };
  }, [team, gradings]);

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
                component={renderLink(useTutorialRoutes(matches).ENTER_POINTS_STUDENT.buildPath({
                  tutorialId,
                  sheetId: sheet.id,
                  teamId: team.id,
                  studentId: student.id,
                }))}
              >
                <ListItemIcon>
                  <StudentIcon />
                </ListItemIcon>

                <ListItemText primary={student.name} secondary='Zum Auswählen klicken' />
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
                secondary: pdfDisabled ? 'Keine Bewertung vorhanden.' : undefined,
                Icon: PdfPreviewIcon,
                onClick: () => onPdfPreviewClicked(team),
                disabled: pdfDisabled,
              },
              {
                primary: 'PDF(s) herunterladen',
                secondary: pdfDisabled ? 'Keine Bewertung vorhanden.' : undefined,
                Icon: PdfIcon,
                onClick: () => onGeneratePdfClicked(team),
                disabled: pdfDisabled,
              },
            ]}
          />
        }
        title={`Team #${team.getTeamNoAsString()}`}
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
          initiallySelected={onlyIndividualEntriesAllowed ? 1 : 0}
          color='inherit'
          options={[
            {
              label: 'Punkte eintragen',
              disabled: onlyIndividualEntriesAllowed,
              ButtonProps: {
                component: Link,
                to: useTutorialRoutes(matches).ENTER_POINTS_TEAM.buildPath({
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
