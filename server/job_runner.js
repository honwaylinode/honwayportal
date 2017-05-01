/**
 * a script to run the jobs
 * example: node job_runner.js jim.huang__t16_01-02.invoice
 */

"use strict";

function encrypt(text, password){
  var cipher = crypto.createCipher("aes-256-ctr",password);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

function get_sha1(text) {
  var hash = crypto.createHash("sha1");
  hash.update(text)
  var value = hash.digest("hex");
  return value;
}

var args = process.argv;

if (args.length !== 4) {
  console.log("Missing server environment, example: node job_runner.js [job_id] [SERVER_ENV]");
  process.exit();
}

var fs = require('fs');
var crypto = require('crypto');

var job = {};

var __ENV__ = args[3];

var content = fs.readFileSync(__dirname + "/" + "config_" + __ENV__ + ".json").toString();
var config = JSON.parse(content);

job.id = args[2]; 
job.output_dir = __dirname + "/" + config.job_output_dir;
var job_id_comps = job.id.split("__");
job.dir = __dirname + "/jobs/";
job.log_file = __dirname + "/jobs/" + job.id + "__log";
job.percentage_file = __dirname + "/jobs/" + job.id + "__percentage";
var order_type_comps = job_id_comps[1].split(".");
job.order_id = order_type_comps[0];
job.type = order_type_comps[1];
job.file_ext = config.job_workers[job.type];

//add assisting functions 
job.log = function(message) {
  fs.appendFileSync(this.log_file, message + "\n");
}

job.percentage = function(percentage) {
  fs.writeFileSync(this.percentage_file, percentage);
}

job.generateTargetFileName = function() {
  var job_secret = config.job_secret;
  var name = get_sha1(encrypt(this.id, job_secret));
  var name = this.output_dir + "/" + name + "." + this.file_ext;
  return name;
}

job.db = require(__dirname + "/libs/honwaydb").init(__dirname + "/db");
job.order = job.db.getEntry("orders." + job.order_id);

var Worker = require(__dirname + "/jobworkers/" + job.type);
var worker = new Worker(job);

//empty the job log first 
fs.writeFileSync(job.log_file, "");
worker.doJob(job);
