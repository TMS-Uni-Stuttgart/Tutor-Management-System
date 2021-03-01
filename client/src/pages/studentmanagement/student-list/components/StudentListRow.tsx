import { Box, Button, PaperProps, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  AccountSwitch as ChangeTutorialIcon,
  InformationOutline as InfoIcon,
  Mail as MailIcon,
} from 'mdi-material-ui';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import { ListItem } from '../../../../components/list-item-menu/ListItemMenu';
import StudentAvatar from '../../../../components/student-icon/StudentAvatar';
import { Student } from '../../../../model/Student';
import { ROUTES } from '../../../../routes/Routing.routes';
import ScheinStatusBox from '../../../student-info/components/ScheinStatusBox';

const useStyles = makeStyles((theme) =>
  createStyles({
    infoButton: {
      marginLeft: 'auto',
      marginRight: theme.spacing(2),
    },
  })
);

export type SubtextType = 'team' | 'tutorial';

interface GetSubtextParams {
  student: Student;
  subTextType: SubtextType;
}

interface StudentListRowProps extends PaperProps {
  student: Student;
  scheinStatus: ScheinCriteriaSummary;
  subTextType: SubtextType;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onChangeTutorial?: (student: Student) => void;
  tutorialId?: string;
}

function getSubtext({ student, subTextType }: GetSubtextParams): string {
  const { team, tutorial } = student ?? { team: undefined, tutorial: undefined };

  switch (subTextType) {
    case 'team':
      return team ? `Team: #${team.teamNo.toString().padStart(2, '0')}` : 'Kein Team.';

    case 'tutorial':
      return tutorial ? `Tutorium: ${tutorial.slot}` : 'In keinem Tutorium.';
  }
}

function StudentListRow({
  student,
  scheinStatus,
  subTextType,
  tutorialId,
  onEdit,
  onDelete,
  onChangeTutorial,
  className,
  ...props
}: StudentListRowProps): JSX.Element {
  const classes = useStyles();
  const additionalMenuItems: ListItem[] = useMemo(() => {
    const items: ListItem[] = [
      {
        primary: 'E-Mail',
        Icon: MailIcon,
        disabled: !student.email,
        onClick: () => {
          window.location.href = `mailto:${student.email}`;
        },
      },
    ];

    if (!!onChangeTutorial) {
      items.push({
        primary: 'Tutorium wechseln',
        onClick: () => onChangeTutorial(student),
        Icon: ChangeTutorialIcon,
      });
    }

    return items;
  }, [onChangeTutorial, student]);

  return (
    <>
      <StudentAvatar student={student} />

      <Box marginLeft={2} minWidth={250} display='flex' flexDirection='column'>
        <Typography>{student.name}</Typography>

        <Typography variant='body2' color='textSecondary'>
          {getSubtext({ student, subTextType })}
        </Typography>
      </Box>

      <ScheinStatusBox scheinStatus={scheinStatus} marginLeft={2} marginRight='auto' />

      <Button
        variant='outlined'
        component={Link}
        to={ROUTES.STUDENT_INFO.create({
          tutorialId,
          studentId: student.id,
        })}
        startIcon={<InfoIcon />}
        className={classes.infoButton}
      >
        Informationen
      </Button>

      <EntityListItemMenu
        onEditClicked={() => onEdit(student)}
        onDeleteClicked={() => onDelete(student)}
        additionalItems={additionalMenuItems}
      />
    </>
  );
}

export default StudentListRow;
