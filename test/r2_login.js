process.chdir( "./test/fixtures/clay_sf" );

var fs     = require("fs");
var test   = require('tape');
var gulp   = require("gulp");
var login     = require("../plugins/gulp-r2").login;
var glog   = require('gulp-api-log');

//glog(gulp);

test('should login to salesforce with fn', function (t) {
  t.plan(1);
  var env = fs.readFileSync( __dirname + "/.env", "utf-8" );
  var credentials = JSON.parse( env );

  login( credentials.SALESFORCE_HOST, credentials.SALESFORCE_USERNAME, credentials.SALESFORCE_PASSWORD + credentials.SALESFORCE_TOKEN, function(err, res){
    t.equal( err, null );
  })  
});


test('should login to salesforce with fn and config', function (t) {
  t.plan(1);

  var env = fs.readFileSync( __dirname + "/.env", "utf-8" );
  
  var credentials = JSON.parse( env );

  var config = require("../clayconfig");
  login.setter = config;

  config.set("USER", { 
    salesforce_user_name: credentials.SALESFORCE_USERNAME,
    salesforce_password:  credentials.SALESFORCE_PASSWORD,
    salesforce_token: credentials.SALESFORCE_TOKEN,
    salesforce_host: credentials.SALESFORCE_HOST
  });

  gulp.task("LOGIN_T_1", ['R2_LOGIN'], function(){
    t.equal( config.get( "USER_SESSION", null) == null, false  );
  })
  
  gulp.start("LOGIN_T_1");

});