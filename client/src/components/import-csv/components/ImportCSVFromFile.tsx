import { Box, Grow, Typography } from '@material-ui/core';
import { FileCheckOutline as FileSelectedIcon } from 'mdi-material-ui';
import React from 'react';
import OutlinedBox from '../../OutlinedBox';
import UploadFileButton from '../../UploadFileButton';

export interface FileInformation {
  content: string;
  fileName: string;
}

interface ImportCSVFromFileProps {
  fileInfo: FileInformation;
  onFileInfoChanged: (newInfo: FileInformation) => void;
}

function ImportCSVFromFile({ fileInfo, onFileInfoChanged }: ImportCSVFromFileProps): JSX.Element {
  return (
    <>
      <UploadFileButton
        supportedFileTypes={['application/vnd.ms-excel']}
        onFileSelect={(content: string, file: File) =>
          onFileInfoChanged({ content, fileName: file.name })
        }
      >
        CSV-Datei auswählen
      </UploadFileButton>

      <Grow
        in={!!fileInfo.fileName}
        timeout={750}
        style={{ transformOrigin: 'top center' }}
        // Add a key so the box replays the animation if the user selects a different file.
        key={`key-${fileInfo.fileName}`}
      >
        <OutlinedBox
          minWidth='20%'
          maxWidth='100%'
          marginTop={2}
          paddingLeft={3}
          paddingRight={3}
          display='flex'
          flexDirection='column'
          alignItems='center'
          alignSelf='center'
          borderColor='success.main'
        >
          <Box
            component='span'
            marginBottom={1.5}
            display='grid'
            gridTemplateColumns='repeat(2, max-content)'
            gridColumnGap={4}
            alignItems='center'
          >
            <FileSelectedIcon fontSize='large' />
            <Typography variant='h6'>Ausgewählte Datei:</Typography>
          </Box>

          <Typography>{fileInfo.fileName}</Typography>
        </OutlinedBox>
      </Grow>
    </>
  );
}

export default ImportCSVFromFile;
