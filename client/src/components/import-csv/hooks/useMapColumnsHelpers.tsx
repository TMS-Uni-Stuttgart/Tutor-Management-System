import { useContext } from 'react';
import { DataContext } from '../ImportCSV.context';
import { CSVData, DataContextValue, MapColumnsHelpers } from '../ImportCSV.types';

export function useMapColumnsHelpers<
  COL extends string,
  GRP extends string = string
>(): MapColumnsHelpers<COL, GRP> & { isLoading: boolean; data: CSVData } {
  const { data, isLoading, mapColumnsHelpers } = useContext<DataContextValue<COL, GRP>>(
    DataContext
  );
  return { data, isLoading, ...mapColumnsHelpers };
}
