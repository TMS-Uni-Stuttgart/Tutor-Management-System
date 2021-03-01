import {
  CSVDynamicColumnInformation,
  CSVStaticColumnInformation,
  isDynamicColumnInformation,
} from '../../ImportCSV.types';
import { MapFormValues, Metadata } from './MapForm';

export interface StaticBoxData {
  key: string;
  label: string;
  required: boolean;
  helperText: string;
}

export interface StaticBoxGroup {
  key: string;
  title: string;
  boxData: StaticBoxData[];
}

export interface DynamicBoxData {
  key: string;
  title: string;
}

export function generateInitialValues(metadata: Metadata, headers: string[]): MapFormValues {
  const values: MapFormValues = {};

  for (const [key, value] of Object.entries(metadata.information)) {
    if (isDynamicColumnInformation(value)) {
      values[key] = [];
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

export function groupStaticData(metadata: Metadata): StaticBoxGroup[] {
  const groups: StaticBoxGroup[] = [];
  const entries = Object.entries(metadata.groups).sort(([, a], [, b]) => a.index - b.index);

  for (const [key, value] of entries) {
    const columns = Object.entries(metadata.information).filter(function (
      entry
    ): entry is [string, CSVStaticColumnInformation<string>] {
      const [, info] = entry;
      return !isDynamicColumnInformation(info) && info.group === key;
    });
    const boxData: StaticBoxData[] = [];

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

export function getDynamicData(metadata: Metadata): DynamicBoxData[] {
  const boxes: DynamicBoxData[] = [];
  const dynamicData: [string, CSVDynamicColumnInformation][] = Object.entries(
    metadata.information
  ).filter(function (entry): entry is [string, CSVDynamicColumnInformation] {
    const [, info] = entry;
    return isDynamicColumnInformation(info);
  });

  dynamicData.forEach(([key, data]) => {
    const astrix = data.required ? '*' : '';
    boxes.push({ key, title: `${data.label}${astrix}` });
  });

  return boxes;
}
