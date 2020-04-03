import { Button, TableCell } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  AccountSwitch as ChangeTutorialIcon,
  InformationOutline as InfoIcon,
  Mail as MailIcon,
} from 'mdi-material-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import { getNameOfEntity } from 'shared/util/helpers';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import { ListItem } from '../../../../components/list-item-menu/ListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../../components/PaperTableRow';
import StudentAvatar from '../../../../components/student-icon/StudentAvatar';
import { Student } from '../../../../model/Student';
import { getStudentInfoPath } from '../../../../routes/Routing.helpers';
import ScheinStatusBox from '../../student-info/components/ScheinStatusBox';
import { useStudentStore } from '../../student-store/StudentStore';

const useStyles = makeStyles((theme) =>
  createStyles({
    statusProgress: {
      maxWidth: '200px',
      margin: theme.spacing(1),
    },
    progressBarCell: {
      width: '100%',
    },
    infoButton: {
      paddingRight: theme.spacing(1),
    },
  })
);

type StudentCallback = (student: Student) => void;

interface Props extends PaperTableRowProps {
  student: Student;
  onEdit: StudentCallback;
  onDelete: StudentCallback;
  onChangeTutorial?: StudentCallback;
  subtextPrefix?: string;
  scheinStatus?: ScheinCriteriaSummary;
  showTutorial?: boolean;
}

interface GetSubtextParams {
  student?: Student;
  prefix?: string;
  showTutorial?: boolean;
}

function getSubtext({ student, showTutorial, prefix }: GetSubtextParams): string {
  const { team, tutorial } = student ?? { team: undefined, tutorial: undefined };
  let subText = '';

  if (showTutorial) {
    subText = tutorial ? `Tutorium: ${tutorial.slot}` : 'In keinem Tutorium.';
  } else {
    subText = team ? `Team: #${team.teamNo.toString().padStart(2, '0')}` : 'Kein Team.';
  }

  if (!!prefix) {
    subText = `${prefix} - ${subText}`;
  }

  return subText;
}

function StudentRow({
  student,
  subtextPrefix,
  className,
  onEdit,
  onDelete,
  onChangeTutorial,
  scheinStatus,
  showTutorial,
  ...props
}: Props): JSX.Element {
  const classes = useStyles();
  const [{ tutorialId }] = useStudentStore();

  const additionalMenuItems: ListItem[] = [
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
    additionalMenuItems.push({
      primary: 'Tutorium wechseln',
      onClick: () => onChangeTutorial(student),
      Icon: ChangeTutorialIcon,
    });
  }

  return (
    <PaperTableRow
      {...props}
      label={getNameOfEntity(student)}
      subText={getSubtext({ student, prefix: subtextPrefix, showTutorial })}
      Avatar={<StudentAvatar student={student} />}
      className={className}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEdit(student)}
          onDeleteClicked={() => onDelete(student)}
          additionalItems={additionalMenuItems}
        />
      }
    >
      <TableCell align='right' className={classes.infoButton}>
        <ScheinStatusBox scheinStatus={scheinStatus} />
      </TableCell>

      <TableCell align='right' className={classes.infoButton}>
        <Button
          variant='outlined'
          component={Link}
          to={getStudentInfoPath({
            studentId: student.id,
            tutorialId,
          })}
          startIcon={<InfoIcon />}
        >
          Informationen
        </Button>
      </TableCell>
    </PaperTableRow>
  );
}

export default StudentRow;
