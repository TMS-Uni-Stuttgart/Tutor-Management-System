import React, { ChangeEvent, useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import CustomSelect from '../../../components/CustomSelect';
import { Sheet } from '../../../model/Sheet';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { getAllSheets } from '../../../hooks/fetching/Sheet';

interface RouteParams {
  sheetId?: string;
}

interface GenerateOptions {
  sheetId: string;
}

interface SheetSelectorOptions {
  componentProps: OuterProps;
  generatePath: ({ sheetId }: GenerateOptions) => string;
}

interface OuterProps {
  className?: string;
}

interface Props extends OuterProps {
  generatePath: ({ sheetId }: GenerateOptions) => string;
  sheets: Sheet[];
  isLoadingSheets: boolean;
  currentSheet?: Sheet;
  onChange: SelectInputProps['onChange'];
}

export function useSheetSelector({ generatePath, componentProps }: SheetSelectorOptions) {
  const history = useHistory();
  const { setError } = useErrorSnackbar();
  const { sheetId } = useParams<RouteParams>();

  const [isLoadingSheets, setLoadingSheets] = useState(false);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState<Sheet>();

  useEffect(() => {
    if (!!sheetId) {
      setLoadingSheets(true);
    }

    getAllSheets()
      .then(sheets => {
        setSheets(sheets);
      })
      .catch(() => setError('Blätter konnten nicht abgerufen werden'))
      .finally(() => setLoadingSheets(false));
  }, [setError, sheetId]);

  useEffect(() => {
    if (currentSheet?.id === sheetId) {
      return;
    }

    if (!!sheetId) {
      setCurrentSheet(sheets.find(s => s.id === sheetId));
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
    SheetSelector: () => (
      <SheetSelector
        {...componentProps}
        onChange={onSheetSelection}
        sheets={sheets}
        currentSheet={currentSheet}
        generatePath={generatePath}
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
  return (
    <CustomSelect
      label='Blatt wählen'
      emptyPlaceholder='Keine Bätter vorhanden.'
      className={className}
      items={sheets}
      itemToString={sheet => sheet.toDisplayString()}
      itemToValue={sheet => sheet.id}
      value={currentSheet ? currentSheet.id : ''}
      onChange={onChange}
    />
  );
}
