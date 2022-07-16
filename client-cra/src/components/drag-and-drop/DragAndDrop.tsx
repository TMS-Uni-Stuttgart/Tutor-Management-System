import { Box, BoxProps, Typography } from '@material-ui/core';
import { createStyles, fade, makeStyles } from '@material-ui/core/styles';
import { ClipboardArrowDown as DropIcon, CloseCircle as NotAllowedIcon } from 'mdi-material-ui';
import React, { useCallback, useRef, useState } from 'react';

const useStyles = makeStyles((theme) => {
  const background = fade(theme.palette.background.paper, 0.85);
  return createStyles({
    overlay: {
      background,
      color: theme.palette.getContrastText(background),
      borderStyle: 'dashed',
    },
    overlayText: {
      margin: theme.spacing(0, 4),
    },
  });
});

interface Props
  extends Omit<BoxProps, 'onDragEnter' | 'onDragLeave' | 'onDrop' | 'onDragOver' | 'position'> {
  /** List of all MIME types that should be accepted */
  supportedFileTypes: string[];

  /**
   * Gets passed in the file that the user dropped here if
   * - The user only dropped exactly one file
   * - The dropped file has one of the supported types
   */
  handleFileDrop: (file: File) => void;

  /** Disables the drop feature. */
  disabled?: boolean;
}

interface OverlayData {
  text: string;
  canBeDropped: boolean;
}

function isFileSupported(file: File | DataTransferItem, supportedFileTypes: string[]): boolean {
  return supportedFileTypes.indexOf(file.type) !== -1;
}

function areAllItemsSupported(items: DataTransferItemList, supportedFileTypes: string[]): boolean {
  for (const item of items) {
    if (!isFileSupported(item, supportedFileTypes)) {
      return false;
    }
  }

  return true;
}

function DragAndDrop({
  children,
  supportedFileTypes,
  handleFileDrop,
  disabled,
  ...boxProps
}: Props): JSX.Element {
  const classes = useStyles();
  const [overlayData, setOverlayData] = useState<OverlayData | undefined>();

  // Keep track of the depth bc every child of the child is firing the drag events, too. If one does not keep track and not only hides the overlay when the user entirely leaves the component the overlay starts flickering.
  const dragDepth = useRef<number>(0);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) {
        return;
      }

      if (dragDepth.current === 0) {
        if (e.dataTransfer.items.length === 0) {
          return;
        }

        if (e.dataTransfer.items.length > 1) {
          setOverlayData({
            text: 'Es wird nur eine Datei unterstützt.',
            canBeDropped: false,
          });
        } else if (areAllItemsSupported(e.dataTransfer.items, supportedFileTypes)) {
          setOverlayData({ text: 'Datei hochladen.', canBeDropped: true });
        } else {
          setOverlayData({ text: 'Falsches Dateiformat.', canBeDropped: false });
        }
      }

      dragDepth.current++;
    },
    [supportedFileTypes, disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) {
        return;
      }

      dragDepth.current--;

      if (dragDepth.current <= 0) {
        setOverlayData(undefined);
        dragDepth.current = 0;
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) {
        return;
      }

      dragDepth.current = 0;
      setOverlayData(undefined);

      const fileCount = e.dataTransfer.files.length;

      if (fileCount !== 1) {
        return;
      }

      const file = e.dataTransfer.files.item(0);

      if (file && isFileSupported(file, supportedFileTypes)) {
        handleFileDrop(file);
      }
    },
    [handleFileDrop, supportedFileTypes, disabled]
  );

  return (
    <Box
      {...boxProps}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      position='relative'
    >
      {overlayData && (
        <Box
          border={4}
          borderColor={overlayData.canBeDropped ? 'primary.main' : 'error.main'}
          position='absolute'
          top={0}
          bottom={0}
          left={0}
          right={0}
          zIndex={9999}
          display='flex'
          alignItems='center'
          justifyContent='center'
          className={classes.overlay}
        >
          {overlayData.canBeDropped ? <DropIcon /> : <NotAllowedIcon />}
          <Typography className={classes.overlayText}>{overlayData.text}</Typography>
          {overlayData.canBeDropped ? <DropIcon /> : <NotAllowedIcon />}
        </Box>
      )}
      {children}
    </Box>
  );
}

export default DragAndDrop;
