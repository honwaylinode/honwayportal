module.exports=
class LineColonKVParser 
{
  static parse(data) {
    var result = {};
    data = data.trim();
    var lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var comps = lines[i].trim().split(":");
      var key = comps[0].trim();
      var value = comps[1].trim();
      result[key] = value;
    }
    return result;
  }
}
