import React from 'react';
import { Box } from '@material-ui/core';
import { useSheetSelector } from '../../components/sheet-selector/SheetSelector';
import { getPresentationPointsPath } from '../../routes/Routing.helpers';
import { useParams } from 'react-router';

interface RouteParams {
  sheetId?: string;
  tutorialId?: string;
}

function PresentationPoints(): JSX.Element {
  const { tutorialId } = useParams<RouteParams>();

  const { SheetSelector, currentSheet, isLoadingSheets } = useSheetSelector({
    generatePath: ({ sheetId }) => {
      if (!tutorialId) {
        throw new Error('The path needs to contain a tutorialId parameter.');
      }

      return getPresentationPointsPath({ tutorialId, sheetId });
    },
  });

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={2} alignItems='center'>
        <SheetSelector />
      </Box>
      Work in progress
    </Box>
  );
}

export default PresentationPoints;
