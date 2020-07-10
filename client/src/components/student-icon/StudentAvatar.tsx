import { Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import clsx from 'clsx';
import {
  Account as PersonIcon,
  FileCheck as NoScheinRequiredIcon,
  MessageAlert as WarningIcon,
  Sleep as InactiveIcon,
} from 'mdi-material-ui';
import React from 'react';
import { StudentStatus } from 'shared/model/Student';
import { Student } from '../../model/Student';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    warningAvatar: {
      backgroundColor: theme.palette.warning.main,
    },
  })
);

interface StudentAvatarProps {
  student: Student;
}

function getStudentIcon(student: Student): React.FunctionComponent<SvgIconProps> {
  switch (student.status) {
    case StudentStatus.INACTIVE:
      return InactiveIcon;

    case StudentStatus.NO_SCHEIN_REQUIRED:
      return NoScheinRequiredIcon;
  }

  if (!student.matriculationNo) {
    return WarningIcon;
  }

  return PersonIcon;
}

function getStudentTooltip(student: Student): string | undefined {
  switch (student.status) {
    case StudentStatus.INACTIVE:
      return 'Student/in ist inaktiv.';

    case StudentStatus.NO_SCHEIN_REQUIRED:
      return 'Student/in hat bereits einen Schein.';
  }

  if (!student.matriculationNo) {
    return 'Student/in hat keine hinterlegte Matrikelnummer.';
  }

  return undefined;
}

function StudentAvatar({ student }: StudentAvatarProps): JSX.Element {
  const classes = useStyles();
  const Icon = getStudentIcon(student);
  const tooltip: string | undefined = getStudentTooltip(student);

  const AvatarComp = (
    <Avatar
      className={clsx({
        [classes.warningAvatar]:
          student.status === StudentStatus.ACTIVE && !student.matriculationNo,
      })}
    >
      <Icon />
    </Avatar>
  );

  return tooltip ? <Tooltip title={tooltip}>{AvatarComp}</Tooltip> : AvatarComp;
}

export default StudentAvatar;
