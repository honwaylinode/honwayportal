module.exports = 
class Main 
{
  static handle(ctx) {
    var LineColonKVParser = require('../libs/line_colon_kv_parser.js');
    var data = ctx.request.body;
    console.log(data);
    if (data.access_token == undefined) {
      ctx.body = JSON.stringify({"success": false, "error": "No Access Token"});
      return;
    }

    var user = ctx.authenticator.getUserFromAccessToken(data.access_token);
    if (user.authenticated == 0) {
      ctx.body = JSON.stringify({"success": false, "error": "Invalid Access Token!"});
      return;
    }

    if (data.id == undefined) {
      ctx.body = JSON.stringify({"success": false, "error": "No Order ID"});
      return;
    }

    var order = ctx.db.getEntry("orders." + data.id);
    order['pssk.meat'] = LineColonKVParser.parse(order['pssk.meat']);
    ctx.body = JSON.stringify({"success": true, "data" : order});
  }
}
