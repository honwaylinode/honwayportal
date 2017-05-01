'use strict';

module.exports = 
class HonwayDB
{
  static init(dbDir) {
    this.dbDir = dbDir;
    return this;
  }

  static getEntry(name) {
    var fs = require("fs");
    var entryPath = this.dbDir + "/" + name;
    var content = fs.readFileSync(entryPath).toString();
    var entry = this.parseEntryContent(content);
    return entry;
  }

  static getEntryRaw(name) {
    var fs = require("fs");
    var entryPath = this.dbDir + "/" + name;
    var content = fs.readFileSync(entryPath).toString();
    return content;
  }

  static saveEntry(name, entryContent) {
    var fs = require("fs");
    var entryPath = this.dbDir + "/" + name;
    fs.writeFileSync(entryPath, entryContent, 'utf8');  
  }

  static parseEntryContent(content) {
    content = content.trim(); //trim the content 
    var entry = {};
    var lines = content.split("\n");
    var lineCount = lines.length;
    var fieldName = "";
    for (var i = 0; i < lineCount; i++ ) {
      //strip comments and trim line 
      var line = this.stripComments(lines[i]).trim();
      
      if (line[0] == "[" ) {
        //reset field lines, get the previous field content
        var nextFieldName = line.replace("[","").replace("]","").trim();
        if (nextFieldName.length > 0) {  
          entry[nextFieldName] = [];
        } 
      } else {
        if (line.length > 0) {
          entry[nextFieldName].push(line);
        }
      }
    }

    //now implode all lines 
    var keys = Object.keys(entry);
    for (var i = 0; i < keys.length; i ++) {
      var key = keys[i];
      entry[key] = entry[key].join("\n");
    }
    return entry;
  }

  static stripComments(s) {
    var re1 = /^\s+|\s+$/g;  // Strip leading and trailing spaces
    var re2 = /\s*[#].+$/g; // Strip everything after #, to the end of the line, including preceding spaces 
    return s.replace(re1,'').replace(re2,'');
  }

}
