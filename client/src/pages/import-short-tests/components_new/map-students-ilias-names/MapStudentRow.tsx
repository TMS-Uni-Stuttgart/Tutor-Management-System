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
    <>
      <Typography>{iliasName}</Typography>

      {mappedStudent && (
        <Box marginX={2}>
          <Chip label={mappedStudent.name} onDelete={onRemoveMapping} color='primary' />
        </Box>
      )}

      <Box marginLeft='auto'>
        <Button onClick={onMapStudent}>Studierende/n zuordnen</Button>
      </Box>
    </>
  );
}

export default MapStudentRow;
