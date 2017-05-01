module.exports=
class Main 
{
  static handle(ctx) {
    //authenticate user, this marks the beginning of a user session 
    var result = {
      success: 0
    };

    var data = ctx.request.body;
    if (data.username == undefined) {
      result.error = "Missing Username!"; 
      ctx.body = JSON.stringify(result);
      return;
    }

    if (data.password == undefined) {
      result.error = "Missing Password!"; 
      ctx.body = JSON.stringify(result);
      return;
    }

    var user = ctx.authenticator.getUserByUsername(data.username);

    if (user == undefined) {
      result.error = "Invalid User!";
      ctx.body = JSON.stringify(result);
      return;
    }

    if (user != undefined) {
      if (ctx.authenticator.getPasswordHash(data.password) == user.password_hash) {
        //now the user is considered logged in ! 
        user.authenticated = 1;
        //now generate the access token 
        user.login_timestamp = Date.now();
        result.access_token = ctx.authenticator.createAccessTokenForUser(user);
        //also add user's permissions
        result.permissions = user.permissions; 
        result.success = 1;
      }
    }
    ctx.body = JSON.stringify(result);
  }
}
