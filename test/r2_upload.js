process.chdir( "./test/fixtures/clay_sf" );

var fs = require("fs");
var test = require('tape');
var gulp = require("gulp");

var r2 = require("../plugins/gulp-r2");


var config = require("../clayconfig");
r2.login.setter = config;

var glog = require('gulp-api-log');
glog(gulp);

test('should upload a test vf page to salesforce', function (t) {
  t.plan(1);
  
  var env = fs.readFileSync( __dirname + "/.env", "utf-8" );

  var credentials = JSON.parse(env);

  config.set("USER", { 
    salesforce_user_name: credentials.SALESFORCE_USERNAME,
    salesforce_password:  credentials.SALESFORCE_PASSWORD,
    salesforce_token: credentials.SALESFORCE_TOKEN,
    salesforce_host: credentials.SALESFORCE_HOST
   });

  gulp.task("TEST_R2UPLOAD_1", ['R2_LOGIN'],function(){
    
    
    return gulp.src([ "./upload.html" ] )     
    .pipe( r2.upload( { name: "testapp", session: config.get("USER_SESSION") } ) )

  });

  gulp.task("TEST_R2UPLOAD_2", ['TEST_R2UPLOAD_1'],function(){
    t.equal( r2.upload.lastResult , true );
  });

  gulp.start("TEST_R2UPLOAD_2");
  
});





