declare module 'excel4node' {
  export class Workbook {
    addWorksheet(name: string): Worksheet;

    writeToBuffer(): Buffer;
  }

  export interface Worksheet {
    cell: (row: number, col: number) => any;
  }
}
