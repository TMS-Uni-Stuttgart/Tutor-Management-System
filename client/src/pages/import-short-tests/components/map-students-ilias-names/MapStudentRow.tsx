import { Box, Button, Chip, Typography } from '@material-ui/core';
import React from 'react';
import { Student } from '../../../../model/Student';

interface Props {
  iliasName: string;
  mappedStudent: Student | undefined;
  onMapStudent: () => void;
  onRemoveMapping: () => void;
}

function MapStudentRow({
  iliasName,
  mappedStudent,
  onMapStudent,
  onRemoveMapping,
}: Props): JSX.Element {
  return (
    <Box
      width='inherit'
      height='inherit'
      display='grid'
      gridTemplateColumns='auto 1fr auto'
      gridColumnGap={16}
      alignItems='center'
    >
      <Typography>{iliasName}</Typography>

      <Box justifySelf='end'>
        {mappedStudent && (
          <Chip label={mappedStudent.name} onDelete={onRemoveMapping} color='primary' />
        )}
      </Box>

      <Box>
        <Button onClick={onMapStudent}>Studierende/n zuordnen</Button>
      </Box>
    </Box>
  );
}

export default MapStudentRow;
