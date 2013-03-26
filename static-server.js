var express = require("express"),
    app     = express();
    port    = parseInt(process.env.PORT, 10) || 8000;

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static('deploy'));
  app.use(express.static(__dirname));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.use(express.logger({format: 'dev'}));
  app.use(app.router);
});

app.get('*', function(req, res, next){
  res.sendfile('./public/index.html');
});

if (!module.parent) {
  app.listen(port);
  console.log('Express static server started on 127.0.0.1:' + port);
}