module.exports= 
class Main 
{
  static handle(ctx)
  {
    var data = ctx.request.body;

    if (data.access_token == undefined) {
      ctx.body = JSON.stringify({"success": false, "error": "No Access Token"});
      return;
    }

    ctx.authenticator.invalidateAccessToken(data.access_token);
    var result = {"success" : true};

    ctx.body = JSON.stringify(result);
  }
}
