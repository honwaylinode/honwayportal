"use strict";

//pure api server in node.js

//////////////// Preload data in Memory ////////////////////////////
function preloadData(config) {
    //very important
  UserDataStore.init(__dirname + '/' + config.db_dir);
  UserAuthenticator.init(config.app_secret);
}

//////////////// The Web Server Parts ///////////////////////
function startWebServer(config) {
  var WebServer = require(__dirname + "/libs/webserver");
  config._context = {};
  config._context.db = db;
  config._context.UserAuthenticator = UserAuthenticator;
  var server = new WebServer(config); 
  server.start();
}

var fs = require('fs');
var db, UserDataStore, UserAuthenticator;

var args = process.argv;

if (args.length !== 3) {
  console.log("Missing server environment, example: node server.js dev");
  process.exit();
} else {
  process.chdir(__dirname);
  var content = fs.readFileSync(__dirname + "/" + "config_" + args[2].trim() + ".json").toString();
  var config = JSON.parse(content);
  config.__ENV__ = args[2].trim();
  // define common libraries and functions

  db = require(__dirname + "/libs/honwaydb").init(__dirname + '/' + config.db_dir);
  UserDataStore = require(__dirname + "/libs/user_datastore");
  UserAuthenticator = require(__dirname + "/libs/user_authenticator");

  //in memory data that's going to be shared in all server requests 
  preloadData(config); //preload data in memory, kind of like drop-in replacement of redis
  startWebServer(config); //start web server
}
