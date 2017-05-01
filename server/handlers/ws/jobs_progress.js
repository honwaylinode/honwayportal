var crypto = require('crypto');

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

function get_target_file(job_id, job_secret, file_ext) {
  var name = get_sha1(encrypt(job_id, job_secret)) + "." + file_ext;
  return name;
}

module.exports=
class Main 
{
  static handle(ctx) {
    ctx.websocket.on('message', function(message){
      //special treatment, keep-alived
      if (message == "keep-alived") {
        return;
      }

      var data = JSON.parse(message);

      var result_message = "";

      //validate all require params
      if (data.access_token == undefined) {
        result_message = JSON.stringify({"success": false, "error": "No Access Token"});
        try {
          ctx.websocket.send(result_message);
        } catch (error) {
          console.log(error);
        }
        return;
      }

      var user = ctx.authenticator.getUserFromAccessToken(data.access_token);
      if (user.authenticated == 0) {
        result_message = JSON.stringify({"success": false, "error": "Invalid Access Token!"});
        try {
          ctx.websocket.send(result_message);
        } catch (error) {
          console.log(error);
        }
        return;
      }

      if (data.order_id == undefined) {
        result_message = JSON.stringify({"success": false, "error": "No Order ID"});
        try {
          ctx.websocket.send(result_message);
        } catch (error) {
          console.log(error);
        }
        return;
      }

      if (data.job_type == undefined) {
        result_message = JSON.stringify({"success": false, "error": "No Job Type!"});
        try {
          ctx.websocket.send(result_message);
        } catch (error) {
          console.log(error);
        }
        return;
      }

      //security fix, we need to make sure the user do have document permission in order to create documents based on the orders 
      if( !user.permissions.includes('document') ) {
        result_message = JSON.stringify({"success": false, "error": "No permission!"});
        ctx.websocket.send(result_message);
        return;
      }

      var job_id = user.username + "__" + data.order_id + "." + data.job_type;
      var target_file = get_target_file(job_id, ctx.config.job_secret, ctx.config.job_workers[data.job_type]);

      //now we are going to create the job!
      var percentage_file = ctx.server_dir + "/jobs/" + user.username + "__" + data.order_id + "." + data.job_type + "__percentage";
      //watch job directory changes 
      var fs = require('fs');
      fs.watch(ctx.server_dir + "/jobs", (eventType, filename) => {
        var filename_path = ctx.server_dir + "/jobs/" + filename;
        if (eventType == "change" && filename_path == percentage_file) {
          fs.readFile(percentage_file, 'utf8', (err, content) => {
            try {
              if (!err) {
                var return_message = JSON.stringify({
                  percentage: content.toString(),
                  job_type: data.job_type,
                  target_file : target_file 
                });
                ctx.websocket.send(return_message);
              }
            }catch (error) { 
              //not a big deal, web socket connection got dropped, just ignore the error
              //console.log("Error: Socket temporary unavailable");
            }
          });
        };
      });

      const spawn = require('child_process').spawn;
      const create_job = spawn('node', [ctx.server_dir + "/job_runner.js", job_id, ctx.config.__ENV__]);

      create_job.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      create_job.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      create_job.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });

    });
  }
}
