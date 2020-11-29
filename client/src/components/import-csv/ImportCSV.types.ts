export interface ParsedCSVDataRow {
  [header: string]: string;
}

export interface ParsedCSVData {
  headers: string[];
  rows: ParsedCSVDataRow[];
}

export interface CSVDataRow {
  rowNr: number;
  data: ParsedCSVDataRow;
}

export interface CSVData {
  headers: string[];
  rows: CSVDataRow[];
}

export interface CSVFormData {
  csvInput: string;
  separator: string;
}

export type HandleSubmit = () => Promise<{ isSuccess: boolean }>;

export interface ImportCSVHelpers {
  csvFormData: CSVFormData;
  setCSVFormData: (data: CSVFormData) => void;
  handleCSVFormSubmit: HandleSubmit;
  canSubmitCSV: boolean;
}

export interface MapColumnsHelpers<COL extends string, GRP extends string> {
  mapColumnsData: MapColumnsData<COL, GRP>;
  mappedColumns: MappedColumns<COL>;
  setMappedColumns: (columns: MappedColumns<COL>) => void;
  handleMappedColumnsSubmit: HandleSubmit;
  mapColumnBoxes: JSX.Element[];
  isValidFormState: boolean;
}

export interface DataContextValue<COL extends string, GRP extends string> {
  data: CSVData;
  isLoading: boolean;
  importCsvHelpers: ImportCSVHelpers;
  mapColumnsHelpers: MapColumnsHelpers<COL, GRP>;
}

interface MapColumnsInformation<G extends string> {
  /** Label to show to the user. */
  label: string;
  /** Used internally to try and auto-match the CSV columns without user interaction. */
  headersToAutoMap: string[];
  /** Used to visually group related labels. */
  group: G;
  /** Marks the corresponding field as required */
  required?: boolean;
}

interface MapColumnsGroup {
  /** Name of the group shown to the user. */
  name: string;
  /** The lower the index the higher up in the UI the group will be displayed */
  index: number;
}

export type MapColumnsData<COL extends string, GRP extends string> = {
  /** Information about the columns to map. */
  information: {
    [key in COL]: MapColumnsInformation<GRP>;
  };
  /** Information about the visual groups. */
  groups: {
    [key in GRP]: MapColumnsGroup;
  };
};

export type MappedColumns<COL extends string> = {
  [key in COL]: string;
};

export type Column<T> = T extends MapColumnsData<infer COL, any> ? COL : never;
