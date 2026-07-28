import { FinanceExportDataService } from './finance-export-data.service.js';
import { FinanceExportWorkbookService } from './finance-export-workbook.service.js';

export class FinanceExportService {
  static async excel(query = {}) {
    const data = await FinanceExportDataService.build(query);
    return FinanceExportWorkbookService.create(data);
  }
}
