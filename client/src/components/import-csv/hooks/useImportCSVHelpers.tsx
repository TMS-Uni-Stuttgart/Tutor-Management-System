import { useContext } from 'react';
import { DataContext } from '../ImportCSV.context';
import { ImportCSVHelpers } from '../ImportCSV.types';

export function useImportCSVHelpers(): ImportCSVHelpers & { isLoading: boolean } {
  const { isLoading, importCsvHelpers } = useContext(DataContext);
  return { isLoading, ...importCsvHelpers };
}
