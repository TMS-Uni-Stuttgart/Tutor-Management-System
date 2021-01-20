import { Box, Button, CircularProgress } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Upload as UploadIcon } from 'mdi-material-ui';
import React, { useCallback, useState } from 'react';
import DragAndDrop from './drag-and-drop/DragAndDrop';

const useStyles = makeStyles((theme) =>
  createStyles({
    uploadLabel: { flex: 1 },
    uploadButton: { width: '100%' },
    spinner: {},
  })
);

interface UploadFileButtonProps {
  /** Label of the button */
  children: React.ReactNode;

  /**
   * List of supported types.
   *
   * Only files which have one of these types are accepted.
   */
  supportedFileTypes: string[];

  /** Gets called with the content if a valid file was selected. */
  onFileSelect: (content: string, file: File) => Promise<void> | void;
}

function UploadFileButton({
  children,
  supportedFileTypes,
  onFileSelect,
}: UploadFileButtonProps): JSX.Element {
  const classes = useStyles();
  const [isLoading, setLoading] = useState(false);

  const loadFileContent = useCallback(
    async (file: File) => {
      setLoading(true);

      if (!supportedFileTypes.includes(file.type)) {
        return;
      }

      const content: string = await file.text();
      const cb = onFileSelect(content, file);

      await Promise.resolve(cb);

      setLoading(false);
    },
    [supportedFileTypes, onFileSelect]
  );

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file: File | undefined = e.target.files?.[0];

      if (!file) {
        return;
      }

      await loadFileContent(file);

      // Reset the value so the user can select the same file twice.
      e.target.value = '';
    },
    [loadFileContent]
  );

  return (
    <DragAndDrop
      supportedFileTypes={supportedFileTypes}
      handleFileDrop={loadFileContent}
      disabled={isLoading}
    >
      <Box display='flex'>
        <input
          accept='.csv'
          style={{ display: 'none' }}
          id='icon-button-file'
          type='file'
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        <label htmlFor='icon-button-file' className={classes.uploadLabel}>
          <Button
            variant='outlined'
            disableElevation
            className={classes.uploadButton}
            component='span'
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color='inherit' className={classes.spinner} />
              ) : (
                <UploadIcon />
              )
            }
          >
            {children}
          </Button>
        </label>
      </Box>
    </DragAndDrop>
  );
}

export default UploadFileButton;
