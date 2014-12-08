process.chdir( "./test/fixtures/clay_sf" );

var fs = require("fs");
var test = require('tape');
var gulp = require("gulp");

var r2 = require("../plugins/gulp-r2");
require("../tasks/build");


var config = require("../clayconfig");
r2.login.setter = config;

var glog = require('gulp-api-log');
glog(gulp);

test('should zip dist folder', function (t) {
  t.plan(1);

  var env = fs.readFileSync( __dirname + "/.env", "utf-8" );

  var credentials = JSON.parse(env);

  config.set("ZIP_NAME", "TEST_NAME");

  config.set("USER", { 
    salesforce_user_name: credentials.SALESFORCE_USERNAME,
    salesforce_password:  credentials.SALESFORCE_PASSWORD,
    salesforce_token: credentials.SALESFORCE_TOKEN,
    salesforce_host: credentials.SALESFORCE_HOST
   });

  gulp.task("TEST_R2STATIC_1", ['CLAY_BUILD', "R2_LOGIN"],function(){

    console.log( config.get("USER_SESSION") )

    return gulp.src( [ "./build/**" ] )
    .pipe( r2.static( "test.zip", { session: config.get("USER_SESSION"), name: config.get("ZIP_NAME") } ) )
  });

  gulp.task("TEST_R2STATIC_2", ['TEST_R2STATIC_1'],function(){
    t.equal( true , true );
  });

  gulp.start("TEST_R2STATIC_2");
  
});





