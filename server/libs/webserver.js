/**
 * The web server
 */
module.exports=
class WebServer
{
  constructor(config){
    this.config = config;
  }

  start() {
    var config = this.config;
    var context = this.config._context; //dependency injection
    var bodyParser = require('koa-bodyparser');
    const Koa = require('koa');
    const websockify = require('koa-websocket');
    const app = websockify(new Koa());
    /**
     * This is super important, we need to have this in order for body parser to work!!!
     */
    app.use(bodyParser({
      onerror: function (err, ctx) {
        console.log(err);
      }
    }));
    
    const kr = require('koa-route');

    app.context.config = config;
    app.context.db = context.db;
    app.context.authenticator = context.UserAuthenticator;

    //normal routes
    for (var route in config.routes) {
      var type = config.routes[route];
      app.use(kr[type](route, (ctx) => {
        var handler = ctx.path.substring(5).replace(/\//g,"_");
        require("../handlers/" + handler).handle(ctx);
      })
      );
    }

    //websockets routes

    for (var route in config.websocket_routes){
      var type = config.websocket_routes[route];
      app.ws.use(kr[type](route, function(ctx){
        ctx.config = config;
        ctx.server_dir = __dirname + "/..";
        ctx.db = context.db;
        ctx.authenticator = context.UserAuthenticator;
        var handler = ctx.path.substring(4).replace(/\//g,"_");
        require("../handlers/ws/" + handler).handle(ctx);
      }));
    }

    app.listen(config.server_port);
    console.log("Server start listening on port : " + config.server_port);

  }
}
