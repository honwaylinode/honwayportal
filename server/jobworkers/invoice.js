module.exports = 
class Worker 
{
  doJob(job)
  {
    //add a helper function to Number for formatting 
    Number.prototype.fm = function(showDecimal) {
      var number = this.valueOf();
      if (showDecimal == undefined) {
        showDecimal = false;
      }
      if (showDecimal === true) {
        number = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
      } else {
        number = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        number = number.split(".")[0];
      }
      return number;
    };

    job.percentage(0); //reset percentage to 0

    job.log("begin invoice generation...");
    var order = job.order;

    //console.log(job.db.getEntry("orders.t16_01-02"));
    var PSSK_Report = require("../libs/pssk_report");
    var report = new PSSK_Report(order);
    // Require excel library
    var xl = require('excel4node');

    // Create a new instance of a Workbook class
    var wb = require("../libs/excel_workbook").newInstance();

    job.log("set up worbook sheet view");
    // Add Worksheets to the workbook
    var ws = wb.createWorkSheet('Honway Internationl Invoice', {
      'sheetView' : {
        'zoomScale': 150, // Defaults to 100
        'zoomScaleNormal': 150, // Defaults to 100
        'zoomScalePageLayoutView': 100// Defaults to 100
      }
    });

    job.log('adding honway image');
    //add the honway contact image
    ws.addImage({
      path: __dirname + '/../images/honway_contact.png',
      type: 'picture',
      position: {
        type: 'oneCellAnchor',
        from: {
          col: 1,
          colOff: '0in',
          row: 1,
          rowOff: 0 
        }
      }
    });

    job.log("done");

    job.log("adding farm information...");
    job.percentage(10);

    var entry  = job.db.getEntry("farms." + order["farm"] +".receiver"); //get farm receiver info 

    var row = 11;

    // with the custom worksheet library, we can just do the following, very intuitively
    ws.c("A11").t("To:", {
      font: {
        color: '#000000',
        size: 10,
        name: 'Arial',
        bold: true
      },
      alignment: {
        wrapText: true,
        horizontal: 'left',
        vertical: 'top'
      }
    });

    var lines = entry.info.split("\n");

    for (var i = 0; i < lines.length; i++) {
      ws.c("B" + row, "E" + row, true).t(lines[i],{
        font: {
          color: '#000000',
          size: 10,
          name: 'Arial',
          bold: true
        },
        alignment: {
          wrapText: true,
          horizontal: 'left',
          vertical: 'top'
        }
      } 
      );
      row ++;
    }

    //generate date 
    var styleDateLabel = {
      font: {
        color: '#000000',
        size: 10,
        name: 'Arial',
        bold: true
      },
      alignment: {
        wrapText: true,
        horizontal: 'left',
        vertical: 'top'
      }
    };

    var styleDateValue = {
      font: {
        color: '#000000',
        size: 10,
        name: 'Arial',
        bold: true
      },
      alignment: {
        wrapText: true,
        horizontal: 'center',
        vertical: 'top'
      },
      numberFormat: 'mm dd yyyy'
    };

    ws.c("J13").t("Date",styleDateLabel);

    var monthNames = [
      "Jan", "Feb", "Mar",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];

    var date = new Date();

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    ws.c("K13").t(day + "-" + monthNames[monthIndex] + "-" + year, styleDateValue);

    var styleTitle = {
      font: {
        color: '#000000',
        size: 8,
        name: 'Arial',
        bold: true
      },
      alignment: {
        wrapText: true,
        horizontal: 'left',
        vertical: 'top'
      }
    };

    var styleKey = {
      font: {
        color: '#000000',
        size: 9,
        name: 'Arial',
        bold: true
      },
      alignment: {
        wrapText: true,
        horizontal: 'right',
        vertical: 'top'
      }
    };
    var styleValue = {
      font: {
        color: '#000000',
        size: 9,
        name: 'Arial',
        bold: true
      },
      alignment: {
        wrapText: true,
        horizontal: 'left',
        vertical: 'top'
      }
    };

    job.log("done");
    job.percentage(20);

    /////////////// Beginning PSSK Report //////////////////////////
    job.log("beginning pssk report...");
    row ++; //add one empty row 

    var stylePsskHeader = {
      font: {
        color: '#000000',
        size: 10,
        name: 'Arial',
        bold: true
      },
      alignment: {
        wrapText: true,
        horizontal: 'center',
        vertical: 'center'
      }

    };

    var stylePsskHeaderSmall = {
      font: {
        color: '#000000',
        size: 9,
        name: 'Arial',
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center'
      }

    };


    var stylePsskText = {
      font: {
        color: '#000000',
        size: 10,
        name: 'Arial'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center'
      }

    };

    var stylePsskTextSmall = {
      font: {
        color: '#000000',
        size: 9,
        name: 'Arial'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center'
      }
    };

    var stylePsskTextSmallBold = {
      font: {
        color: '#000000',
        size: 9,
        name: 'Arial',
        bold: true
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center'
      }
    };


    ws.c("A" + row).t("Reference", stylePsskHeader); 
    ws.c("B" + row, "E" + row, true).t("Description/Processing Services", stylePsskHeader); 
    ws.c("G" + row).t("Quantity", stylePsskHeader); 
    ws.c("H" + row).t("Location", stylePsskHeader); 
    ws.c("I" + row).t("Rate", stylePsskHeader); 
    ws.c("J" + row).t("Amount", stylePsskHeader); 
    row ++;

    ws.c("A" + row).t(order["name"], stylePsskText);
    ws.c("B" + row, "E" + row, true).t("Professional Shelling & Sorting for Kernels", stylePsskText);
    ws.c("G" + row).t(report.getOriginalQuantity().fm(), stylePsskText);
    ws.c("H" + row).t(order["inbound.location"], stylePsskText);
    ws.c("I" + row).t(order["pssk.rate"], stylePsskText);
    ws.c("J" + row).t("$" + report.getTotalMoneyAmount().fm(true), stylePsskText);

    row += 2;

    var meatData = report.getMeatData();

    var typeCellRefMap = {
      "w" : "B",
      "hp" : "C",
      "b" : "D",
      "f" : "E"
    };

    var typeLabelMap = {
      "w" : "Wholes",
      "hp" : "Halves/Pcs",
      "b" : "Bad Mts",
      "f" : "Chaff"
    }

    ws.c("A" + row).t("Tote Nos", stylePsskHeaderSmall);
    ws.c("B" + row).t("Wholes(W)", stylePsskHeaderSmall);
    ws.c("C" + row).t("Halves/Pcs(HP)", stylePsskHeaderSmall);
    ws.c("D" + row).t("Bad Mts(B)", stylePsskHeaderSmall);
    ws.c("E" + row).t("Chaff(F)", stylePsskHeaderSmall);
    ws.c("F" + row).t("Totals", stylePsskHeaderSmall);

    row ++;

    for (var type in meatData) {
      var units = meatData[type].data;
      for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        ws.c("A" + row).t(unit.no, stylePsskTextSmall);
        ws.c(typeCellRefMap[unit.type] + row).t(unit.value.fm(true), stylePsskTextSmall);
        var style = stylePsskTextSmallBold;
        style.font.bold = false;
        ws.c("F" + row).t(unit.total.fm(), stylePsskTextSmallBold);
        style.font.bold = true;
        row ++;
      }
      var style = stylePsskTextSmallBold;
      style.alignment.horizontal = "right";
      ws.c("E" + row).t(typeLabelMap[type], style);
      style.alignment.horizontal = "center"; //resume previous style
      ws.c("F" + row).t(meatData[type].total.fm(), stylePsskTextSmallBold);
      row ++;
    }

    //////////////  End PSSK Report ///////////////////////

    job.percentage(50);

    var entry  = job.db.getEntry("honway.bank.wire"); //get wire info
    var keys = Object.keys(entry);

    row ++;
    ws.c("A" + row).t("Wire Info:", styleTitle);
    row++;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = entry[key];
      var valueLineCount = value.split("\n").length;
      ws.c("A" + row, "B" + row, true).t(key + ":", styleKey);
      ws.c("C" + row, "E" + (row + valueLineCount - 1), true).t(value, styleValue);
      row ++; 
    }

    var styleSummary = {
      font: {
        color: '#000000',
        size: 9,
        name: 'Arial',
        bold: true
      },
      alignment: {
        wrapText: false,
        horizontal: 'center',
        vertical: 'center',
        shrinkToFit: true
      }
    };

    var styleSummaryNormal = {
      font: {
        color: '#000000',
        size: 9,
        name: 'Arial'
      },
      alignment: {
        wrapText: false,
        horizontal: 'center',
        vertical: 'center',
        shrinkToFit: true
      }
    };

    job.percentage(80);

    row += 2;
    ws.c("B" + row).t("TOTALS", styleSummary);
    ws.c("C" + row).t("Wholes(W)", styleSummary);
    ws.c("D" + row).t("Halves/Pcs(HP)", styleSummary);
    ws.c("E" + row).t("Bad Mts(B)", styleSummary);
    ws.c("F" + row).t("Chaff(F)", styleSummary);
    ws.c("G" + row, "H" + row, true).t("Net Wt. Returned", styleSummary);
    ws.c("I" + row, "J" + row, true).t("Shells Left in China", styleSummary);

    row ++;
    ws.c("C" + row).t(meatData["w"].total.fm(),styleSummaryNormal);
    ws.c("D" + row).t(meatData["hp"].total.fm(),styleSummaryNormal);
    ws.c("E" + row).t(meatData["b"].total.fm(),styleSummaryNormal);
    ws.c("F" + row).t(meatData["f"].total.fm(),styleSummaryNormal);
    ws.c("G" + row, "H" + row, true).t(report.getMeatTotal().fm(),styleSummaryNormal);
    ws.c("I" + row, "J" + row, true).t(report.getShellQuantity().fm(),styleSummaryNormal);

    row ++;

    ws.c("I" + row, "J" + row, true).t("Total Due", styleSummary);
    row ++;

    ws.c("I" + row, "J" + row, true).t("$" + report.getTotalMoneyAmount().fm(true), styleSummaryNormal);

    job.log("done");

    job.log("writing target file");
    wb.write(job.generateTargetFileName());

    job.log("job completed");
    job.percentage(100); //100% completed
  }
}
