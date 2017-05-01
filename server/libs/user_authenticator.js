var crypto = require('crypto');
var UserDataStore = require('./user_datastore');

function get_sha512(text) {
  var hash = crypto.createHash("sha512");
  hash.update(text)
  var value = hash.digest("hex");
  return value;
}

function get_sha1(text) {
  var hash = crypto.createHash("sha1");
  hash.update(text)
  var value = hash.digest("hex");
  return value;
}


function encrypt(text, password){
  var cipher = crypto.createCipher("aes-256-ctr",password);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text, password){
  var decipher = crypto.createDecipher("aes-256-ctr",password);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports=
class UserAuthenticator 
{
  static init(encryption_key) {
    this.encryption_key = encryption_key;
    this.max_valid_logins_per_user = 5; //a particular user can only have 5 simultanious logins
  }

  /**
   * get the access token for a perticular user
   */
  static createAccessTokenForUser(user)
  {
    //during access token creation, we store the login_timestamp into user's valid_login_timestamps 
    if (user.valid_login_timestamps.length < this.max_valid_logins_per_user) {
      user.valid_login_timestamps.push(user.login_timestamp.toString());
    } else { //this user has more than max simutaneous logins, we discard the old ones
      user.valid_login_timestamps.shift();
      user.valid_login_timestamps.push(user.login_timestamp.toString());
    }

    var access_token;
    var timestamp_key = user.login_timestamp.toString();
    var access_token_1 = encrypt(user.username, timestamp_key);
    var access_token_2 = encrypt(user.password_hash, timestamp_key);
    var access_token_3 = timestamp_key;
    var combined_token = access_token_1 + "." + access_token_2 + "." + access_token_3;
    access_token = encrypt(combined_token, this.encryption_key);
    return access_token;
  }

  static getPasswordHash(password) {
    return get_sha512(password);
  }

  static getAccessTokenInfo(access_token)
  {
    var info = {};
    var access_token_comps = decrypt(access_token, this.encryption_key).split("."); 
    var timestamp_key = access_token_comps[2];
    info.username = decrypt(access_token_comps[0],timestamp_key);
    info.password_hash = decrypt(access_token_comps[1],timestamp_key);
    info.login_timestamp = timestamp_key;
    return info;
  }

  static invalidateAccessToken(access_token)
  {
    var accessTokenInfo = this.getAccessTokenInfo(access_token);
    var username = accessTokenInfo.username;

    var user = UserDataStore.getUserByUsername(username);

    //we can simply delete the login_timestamp that associate with this access token out 
    var index = user.valid_login_timestamps.indexOf(accessTokenInfo.login_timestamp);
    if (index >= 0) {
      user.valid_login_timestamps.splice(index, 1);
    }
  }

  static getUserFromAccessToken(access_token)
  {
    //we are going to construct a new user object to return 
    var result = {};
    var accessTokenInfo = this.getAccessTokenInfo(access_token);
    var username = accessTokenInfo.username;
    var user = UserDataStore.getUserByUsername(username);
    var password_hash = accessTokenInfo.password_hash;
    result.authenticated = 0;
    if (user != undefined 
      && user.username != undefined 
      && user.username == username
      && user.password_hash == password_hash) {
      user.login_timestamp = accessTokenInfo.login_timestamp;
      if (Date.now() - user.login_timestamp < parseInt(user.login_expiration) * 1000) {
        //user is not expired, now check see if the user's login_timestamp is valid 
        if (user.valid_login_timestamps.includes(user.login_timestamp)) {
          result.username = user.username;
          result.authenticated = 1;
          //add user's permissions 
          result.permissions = user.permissions;
        }
      }
    }
    return result;

  }

  static getUserByUsername(username) {
    return UserDataStore.getUserByUsername(username);
  }
}
