module.exports=
class UserDataStore
{
  static init(db_dir) {
    const LineColonKVParser = require("./line_colon_kv_parser");
    const db = require("./honwaydb").init(db_dir);
    this.users = {};
    var userData = db.getEntry("users");
    for (var username in userData) {
      var data = userData[username];
      var user = LineColonKVParser.parse(data);
      //we must first add the username !
      user.username = username;
      //we will add more properties for users
      user.authenticated = 0; //by default users are not authenticated 
      user.login_timestamp = 0; //by default, user never log in 
      user.valid_login_timestamps = []; //store an array of valid login timestamps for a particular user 
      this.users[username] = user;
    }
  }  

  static getUserByUsername(username) {
    if (this.users[username] != undefined) {
      return this.users[username];
    }
  }

}
