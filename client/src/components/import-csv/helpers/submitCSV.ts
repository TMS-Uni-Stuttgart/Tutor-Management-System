import { ProviderContext } from 'notistack';
import { getParsedCSV } from '../../../hooks/fetching/CSV';
import { UseSnackbarWithList } from '../../snackbar-with-list/useSnackbarWithList';
import { NextStepInformation } from '../../stepper-with-buttons/context/StepperContext';
import { CSVContext, ParsedCSVDataRow } from '../ImportCSV.types';
import { CSVParsedError } from 'shared/model/CSV';

interface SubmitParams {
  csv: string;
  separator?: string;
  setCSVData: CSVContext<string, string>['setCSVData'];
  enqueueSnackbar: ProviderContext['enqueueSnackbar'];
  enqueueSnackbarWithList: UseSnackbarWithList['enqueueSnackbarWithList'];
}

export default async function submitCSV({
  csv,
  separator,
  setCSVData,
  enqueueSnackbar,
  enqueueSnackbarWithList,
}: SubmitParams): Promise<NextStepInformation> {
  if (!csv) {
    return { goToNext: false, error: true };
  }

  let isSuccess: boolean = true;

  try {
    const response = await getParsedCSV<ParsedCSVDataRow>({
      data: csv.trim(),
      options: { header: true, delimiter: separator },
    });

    if (response.errors.length > 0) {
      let textBeforeList: string;
      let errors: CSVParsedError[];

      if (response.errors.length > 10) {
        textBeforeList = `Es sind ${response.errors.length} Fehler aufgetreten. Es werden nur die ersten 10 angezeigt.`;
        errors = response.errors.slice(0, 10);
      } else {
        textBeforeList = 'Folgende Fehler sind aufgetreten:';
        errors = response.errors;
      }

      enqueueSnackbarWithList({
        title: 'CSV konnte nicht importiert werden.',
        textBeforeList,
        items: errors.map((err) => `${err.message} (Zeile: ${err.row})`),
        variant: 'error',
      });
      isSuccess = false;
    } else if (!response.meta.fields) {
      enqueueSnackbar('Spaltenüberschriften konnten nicht identifiziert werden.', {
        variant: 'error',
      });
      isSuccess = false;
    } else {
      setCSVData({ headers: response.meta.fields, rows: response.data });
    }
  } catch {
    enqueueSnackbar('CSV konnte nicht importiert werden.', { variant: 'error' });
    isSuccess = false;
  }

  return { goToNext: isSuccess, error: !isSuccess };
}
