'use strict';

const bodyParser= require('body-parser');

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  const MongoClient = require('mongodb').MongoClient;
  var db;

  MongoClient.connect('mongodb://kviz:kviz123@ds137360.mlab.com:37360/kvizdb', (err, database) => {
    if (err) return console.log(err)
    db = database;

    // install middleware
    swaggerExpress.register(app);

    var port = process.env.PORT || 10010;
    app.listen(port);

    if (swaggerExpress.runner.swagger.paths['/hello']) {
      console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
    }
    app.set('view engine', 'ejs');

    app.get('/', function (req, res) {

      db.collection('quotes').find().toArray((err, result) => {
          if (err) return console.log(err)
          // renders index.ejs
          res.render('index.ejs', {quotes: result})
        });

    });

    app.use(bodyParser.urlencoded({extended: true}));
    app.post('/quotes', (req, res) => {
      db.collection('quotes').save(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        res.redirect('/')
      });
    });

  })


});
