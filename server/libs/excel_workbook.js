/**
 * a wrapper around excel workbook
 */
'use strict';

module.exports = 
class Excel_Workbook
{
  static newInstance() {
    var xl = require('excel4node');
    var wb = new xl.Workbook();

    var methodHash = {};

    methodHash["wb.createWorkSheet"] = function(title, options) {
      var ws = this.addWorksheet(title, options);
      ws.c = methodHash["ws.c"];
      return ws;
    }

    methodHash["ws.c"] = function(startCellRef, endCellRef, merged) {
      var startRow, startCol, endRow, endCol;
      var startCell = xl.getExcelRowCol(startCellRef);
      startRow = startCell.row;
      startCol = startCell.col;
      var endCell;
      if (endCellRef != undefined) {
        endCell = xl.getExcelRowCol(endCellRef);
        endRow = endCell.row;
        endCol = endCell.col;
      }
      var cell = this.cell(startRow, startCol, endRow, endCol, merged);
      cell.t = methodHash["cell.t"];
      return cell;
    }

    methodHash["cell.t"] = function(text, styleObj) {
      var style = wb.createStyle(styleObj);
      this.string(text).style(style); 
    }

    wb.createWorkSheet = methodHash["wb.createWorkSheet"]; 

    return wb;
  }
}
