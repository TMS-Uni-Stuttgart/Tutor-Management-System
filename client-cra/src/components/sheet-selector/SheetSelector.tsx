import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { getAllSheets } from '../../hooks/fetching/Sheet';
import { useErrorSnackbar } from '../../hooks/snackbar/useErrorSnackbar';
import { Sheet } from '../../model/Sheet';
import CustomSelect from '../CustomSelect';

const useStyles = makeStyles(() =>
  createStyles({
    select: {
      flex: 1,
    },
  })
);

interface RouteParams {
  sheetId?: string;
}

interface GenerateOptions {
  sheetId: string;
}

interface SheetSelectorOptions {
  generatePath: ({ sheetId }: GenerateOptions) => string;
}

interface OuterProps {
  className?: string;
}

interface Props extends OuterProps {
  sheets: Sheet[];
  isLoadingSheets: boolean;
  currentSheet?: Sheet;
  onChange: SelectInputProps['onChange'];
}

interface UseSheetSelector {
  SheetSelector: (props: OuterProps) => JSX.Element;
  currentSheet: Sheet | undefined;
  isLoadingSheets: boolean;
}

export function useSheetSelector({ generatePath }: SheetSelectorOptions): UseSheetSelector {
  const history = useHistory();
  const { setError } = useErrorSnackbar();
  const { sheetId } = useParams<RouteParams>();

  const [isLoadingSheets, setLoadingSheets] = useState(false);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState<Sheet>();

  useEffect(() => {
    setError(undefined);
    setLoadingSheets(true);

    getAllSheets()
      .then((sheets) => {
        setSheets(sheets);
      })
      .catch(() => setError('Blätter konnten nicht abgerufen werden'))
      .finally(() => setLoadingSheets(false));
  }, [setError]);

  useEffect(() => {
    if (currentSheet?.id === sheetId) {
      return;
    }

    if (!!sheetId) {
      setCurrentSheet(sheets.find((s) => s.id === sheetId));
    } else {
      setCurrentSheet(undefined);
    }
  }, [sheets, sheetId, currentSheet]);

  function onSheetSelection(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const sheetId: string = e.target.value;
    history.push(generatePath({ sheetId }));
  }

  return {
    SheetSelector: (props: OuterProps) => (
      <SheetSelector
        {...props}
        onChange={onSheetSelection}
        sheets={sheets}
        currentSheet={currentSheet}
        isLoadingSheets={isLoadingSheets}
      />
    ),
    currentSheet,
    isLoadingSheets,
  };
}

function SheetSelector({
  className,
  sheets,
  currentSheet,
  isLoadingSheets,
  onChange,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <CustomSelect
      label='Blatt wählen'
      emptyPlaceholder='Keine Bätter vorhanden.'
      className={clsx(classes.select, className)}
      items={sheets}
      itemToString={(sheet) => sheet.toDisplayString()}
      itemToValue={(sheet) => sheet.id}
      value={currentSheet ? currentSheet.id : ''}
      onChange={onChange}
      showLoadingIndicator={isLoadingSheets}
    />
  );
}
