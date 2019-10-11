import xl, { Worksheet } from 'excel4node';

class ExcelService {
  public async generateTestExcel(): Promise<Buffer> {
    const workbook = new xl.Workbook();

    // Add Worksheets to the workbook
    const ws = workbook.addWorksheet('Sheet 1');

    this.fillHeaders(ws, ['Vorname', 'Name', 'Status', 'Matrklnr.', 'Studiengang', 'E-Mail']);

    return workbook.writeToBuffer();
  }

  private fillHeaders(sheet: Worksheet, headers: string[]) {
    headers.forEach((head, idx) => {
      sheet.cell(1, idx + 1).string(head);
    });
  }
}

const excelService = new ExcelService();

export default excelService;
