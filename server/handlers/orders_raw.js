module.exports = 
class Main 
{
  static handle(ctx) {
    var data = ctx.request.body;
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

    //security fix, we need to make sure the user do have edit permission in order to view the raw data!

    if( !user.permissions.includes('edit') ) {
      ctx.body = JSON.stringify({"success": false, "error": "No permission!"});
      return;
    }

    ctx.body = JSON.stringify({
      "success" : true,
      "data" : ctx.db.getEntryRaw("orders." + data.id)
    });
  }
}
