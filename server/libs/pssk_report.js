/**
 * Module: A Professional Selling and Sorting for Kernels Report 
 * Each report contains information of mutiple units, it might be a bag or a tote
 */
'use strict';

module.exports =
class PSSK_Report 
{
  /**
   * constructor 
   * @param: order object 
   */
  constructor(order) {
    this.meatData = this._parseMeatData(order["pssk.meat"]);
    this.originalQuanity = parseInt(order["pssk.original_quantity"]);
    this.rate = parseFloat(order["pssk.rate"]);
  }


  getMeatData() {
    return this.meatData;
  }

  getMeatTotal() {
    var total = 0;
    for( var type in this.meatData) {
      total += this.meatData[type].total;
    }
    return total;
  }

  getOriginalQuantity() {
    return this.originalQuanity;
  }

  getShellQuantity() {
    var quanity = this.originalQuanity - this.getMeatTotal();
    return quanity;
  }

  getRate() {
    return this.rate;
  }

  getTotalMoneyAmount() {
    var amount = parseFloat(this.rate) * this.originalQuanity;
    return amount;
  }

  /**
   * private method, parse the meat data 
   * the goal is to generate the data based on types 
   * (w, h, p, hp, b, f... etc)
   */
  _parseMeatData(data) {
    var units = {};
    var lines = data.trim().split("\n");
    for(var i = 0; i < lines.length; i ++) {
      var line = lines[i].trim();
      var separatorIndex = line.indexOf(":");

      var key = line.substring(0, separatorIndex).trim();
      var value = parseFloat(line.substring(separatorIndex + 1).trim());

      var unit = {};
      var keyComps = key.split(".");

      var no = keyComps[0].trim();
      var type = keyComps[1].trim();

      unit.no = no;
      unit.type = type;
      unit.value = value;

      var noParts = no.split("-");
      var startNo = noParts[0];
      var endNo = noParts[1];
      if (endNo == undefined) {
        endNo = startNo;
      }
      unit.startNo = parseInt(startNo);
      unit.endNo = parseInt(endNo);

      //now there might be duplicate keys, we need to add up the value together for duplicate keys 
      if (units[key] == undefined) {
        units[key] = unit; 
      } else { //this is the duplicated key, we need to add up the value
        units[key].value += value;
      }

    }

    var meatData = {};
    //now we need to calculate the unit totals 
    for (var key in units) {
      var unit = units[key];
      var type = unit.type;
      if (meatData[type] == undefined) {
        meatData[type] = {};
        meatData[type].data = [];
        meatData[type].total = 0;
      }
      unit.total = Math.ceil( unit.value * (unit.endNo - unit.startNo + 1) ); //we do ceil here for the total 
      //update total for key 
      meatData[type].total += unit.total;
      meatData[type].data.push(unit);
    }

    return meatData;
  }

}

//testing 
/*var db = require("./honwaydb").init();//initialize the database*/
/*var order = db.getEntry("orders.t16_01-02");*/
/*var report = new module.exports(order);*/
/*console.log(JSON.stringify(report.getMeatData()));*/
/*console.log(report.getMeatTotal());**/
/*console.log(report.getOriginalQuantity());*/
/*console.log(report.getShellQuantity());*/
/*console.log(report.getRate());*/
/*console.log(report.getTotalMoneyAmount());*/
