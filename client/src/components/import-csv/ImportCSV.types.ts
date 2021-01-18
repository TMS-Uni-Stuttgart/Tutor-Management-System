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

export type CSVMappedColumns<COL extends string> = {
  readonly [key in COL]: string | string[];
};

export interface CSVMapColumnsHelpers<COL extends string, GRP extends string> {
  /**
   * Metadata for the mapping process.
   *
   * Includes which information should be found in the CSV data with possible header names to look out for. Required information can be marked as such.
   *
   * Furthermore, one can group information which can be used to visually group certain UI elements. Adding groups does **NOT** have any impact on the internal data structure.
   */
  readonly metadata: CSVMapColumsMetadata<COL, GRP>;

  /**
   * Result of the mapping through the user.
   *
   * Will contain one column for a 'static' mapping and an array for a 'dynamic' mapping (indicated by the provided `metadata`).
   */
  readonly mappedColumns: CSVMappedColumns<COL>;

  /**
   * Saves the given columns as mapped to the given field.
   *
   * @param field Field to which the columns belong to.
   * @param columns Columns which belong to the given field.
   */
  mapColumn: (field: COL, columns: string | string[]) => void;
}

export function isDynamicColumnInformation(
  info: CSVColumnInformation<string>
): info is CSVDynamicColumnInformation {
  return !!(info as CSVDynamicColumnInformation).dynamic;
}

export type CSVColumnInformation<GRP extends string> =
  | CSVStaticColumnInformation<GRP>
  | CSVDynamicColumnInformation;

export interface CSVMapColumsMetadata<COL extends string, GRP extends string> {
  /** Information about the columns to map. */
  readonly information: {
    readonly [key in COL]: CSVColumnInformation<GRP>;
  };
  /** Information about the visual groups. */
  readonly groups: {
    readonly [key in GRP]: CSVColumnsGroup;
  };
}

interface CSVColumnsInformation {
  /** Label to show to the user. */
  readonly label: string;

  /** Marks the corresponding field as required */
  readonly required?: boolean;
}

export interface CSVStaticColumnInformation<GRP extends string> extends CSVColumnsInformation {
  readonly dynamic?: undefined;

  /** Used internally to try and auto-match the CSV columns without user interaction. */
  readonly headersToAutoMap: string[];

  /** Used to visually group related labels. */
  readonly group: GRP;
}

export interface CSVDynamicColumnInformation extends CSVColumnsInformation {
  /**
   * Marks the field as dynamic.
   *
   * The user can select how many columns and which ones to map to this label.
   */
  readonly dynamic: true;
}

interface CSVColumnsGroup {
  /** Name of the group shown to the user. */
  readonly name: string;

  /** The lower the index the higher up in the UI the group will be displayed */
  readonly index: number;
}

export interface CSVContext<COL extends string, GRP extends string> {
  /**
   * Currently imported CSV as data.
   *
   * If no CSV got imported previously all object array properties are empty arrays.
   */
  readonly csvData: CSVData;

  /**
   * Sets the CSV data to the given one.
   *
   * If other properties (ie mapping columns, ...) rely on the CSV data those properties get (re)-initialized after setting the data.
   */
  setCSVData: (data: ParsedCSVData) => void;

  /** Helper functions and data to allow (re-)mapping of the CSV headers to internal data structures. */
  readonly mapColumnsHelpers: CSVMapColumnsHelpers<COL, GRP>;
}
