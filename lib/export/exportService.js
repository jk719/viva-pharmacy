import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  JSON: 'json'
};

export class ExportService {
  static async formatLoyaltyData(data, format) {
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return ExportService.toCSV(data);
      case EXPORT_FORMATS.EXCEL:
        return ExportService.toExcel(data);
      case EXPORT_FORMATS.JSON:
        return ExportService.toJSON(data);
      default:
        throw new Error('Unsupported export format');
    }
  }

  static async toCSV(data) {
    const fields = [
      'userId',
      'name',
      'email',
      'tier',
      'points',
      'totalSpent',
      'activeCoupons',
      'usedCoupons',
      'lastActivity',
      'joinDate'
    ];

    const parser = new Parser({ fields });
    return parser.parse(data);
  }

  static async toExcel(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Loyalty Program Data');

    // Add headers
    worksheet.columns = [
      { header: 'User ID', key: 'userId', width: 30 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Tier', key: 'tier', width: 15 },
      { header: 'Points', key: 'points', width: 15 },
      { header: 'Total Spent', key: 'totalSpent', width: 15 },
      { header: 'Active Coupons', key: 'activeCoupons', width: 15 },
      { header: 'Used Coupons', key: 'usedCoupons', width: 15 },
      { header: 'Last Activity', key: 'lastActivity', width: 20 },
      { header: 'Join Date', key: 'joinDate', width: 20 }
    ];

    // Add rows
    worksheet.addRows(data);

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    return workbook.xlsx.writeBuffer();
  }

  static async toJSON(data) {
    return JSON.stringify(data, null, 2);
  }
} 