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
import { ISheet } from 'shared/model/Sheet';
import { ITeam } from 'shared/model/Team';
import { getNameOfEntity } from 'shared/util/helpers';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import { useDialog } from '../../../../hooks/DialogService';
import {
  getEnterPointsForTeamPath,
  getEnterPointsForStudentPath,
} from '../../../../routes/Routing.helpers';
import SplitButton from '../../../../components/SplitButton';
import PointsTable from '../../../../components/points-table/PointsTable';
import { renderLink } from '../../../../components/drawer/components/renderLink';
import { PointMap } from 'shared/model/Points';

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      justifyContent: 'flex-end',
    },
  })
);

interface Props {
  tutorialId: string;
  team: ITeam;
  sheet: ISheet;
  onPdfPreviewClicked: (team: ITeam) => void;
  onGeneratePdfClicked: (team: ITeam) => void;
}

function teamToString(team: ITeam): string {
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
      ? team.students.map(student => getNameOfEntity(student, { firstNameFirst: true })).join(', ')
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
                    teamId: team.id,
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
        <PointsTable points={new PointMap(team.points)} sheet={sheet} />
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
