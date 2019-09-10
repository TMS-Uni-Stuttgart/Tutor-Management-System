import { Group as GroupIcon } from '@material-ui/icons';
import React from 'react';
import { Team } from 'shared/dist/model/Team';
import PointsRow, { PointsRowProps } from './PointsRow';

export interface PointRowFormState {
  [key: string]: number;
}

type Props = Omit<PointsRowProps<Team>, 'label' | 'subText' | 'icon'>;

function TeamPointsRow({ entity: team, ...rest }: Props): JSX.Element {
  return (
    <PointsRow
      label={`Team #${team.teamNo.toString().padStart(2, '0')}`}
      subText={team.students.map(student => `${student.lastname}`).join(', ')}
      icon={GroupIcon}
      entity={team}
      {...rest}
    />
  );
}

export default TeamPointsRow;
