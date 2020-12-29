import { CSVStaticColumnInformation, isDynamicColumnInformation } from '../ImportCSV.types';
import { MapFormValues, Metadata } from './MapForm';

export interface BoxData {
  key: string;
  label: string;
  required: boolean;
  helperText: string;
}

export interface BoxGroup {
  key: string;
  title: string;
  boxData: BoxData[];
}

export function generateInitialValues(metadata: Metadata, headers: string[]): MapFormValues {
  const values: MapFormValues = {};

  for (const [key, value] of Object.entries(metadata.information)) {
    if (isDynamicColumnInformation(value)) {
      // TODO: Dynamic case!
    } else {
      values[key] = '';

      headers.forEach((header) => {
        if (value.headersToAutoMap.includes(header)) {
          values[key] = header;
        }
      });
    }
  }

  return values;
}

export function groupData(metadata: Metadata): BoxGroup[] {
  const groups: BoxGroup[] = [];
  const entries = Object.entries(metadata.groups).sort(([, a], [, b]) => b.index - a.index);

  for (const [key, value] of entries) {
    const columns = Object.entries(metadata.information).filter(function (
      entry
    ): entry is [string, CSVStaticColumnInformation<string>] {
      const [, info] = entry;
      return !isDynamicColumnInformation(info) && info.group === key;
    });
    const boxData: BoxData[] = [];

    columns.forEach(([key, column]) => {
      const helperText =
        column.headersToAutoMap.length > 0
          ? `Spalten für Auto-Zuordnung: ${column.headersToAutoMap.join(', ')}`
          : 'Kein Auto-Zuordnung möglich.';

      boxData.push({
        key,
        label: column.label,
        required: !!column.required,
        helperText,
      });
    });

    groups.push({ key, title: value.name, boxData });
  }

  return groups;
}
