var gulp    = require("gulp");
var Path    = require("path")
var fs      = require("fs");
var Q       = require("q");
var crypto  = require('crypto');
var request = require("superagent");

var gutil       = require('gulp-util');
var PluginError = gutil.PluginError;

function SalesforceLogin( host, username, password, callback ){
  if(!host) makeError('host variable must be provided to SalesforceLogin')
  if(!username) makeError('username variable must be provided to SalesforceLogin')
  if(!password) makeError('password variable must be provided to SalesforceLogin, and must include security token')
  if(!callback) makeError('callback variable must be provided to SalesforceLogin')

  var url  = "https://" + host + "/services/oauth2/token";

  var body = {
    grant_type:     "password",
    client_id:      "3MVG9A2kN3Bn17hvlSRXnnVzjDNILmhSt.TZ.MgCe5mAt9XKFYDQV5FCMKm6cpHhbVmTQArgicRUt7zzcWMhQ",
    client_secret:  "256153260162134490",
    username:       username,
    password:       password
  }

  var req = request.post( url )
  .type( "application/x-www-form-urlencoded" )
  .send( body )
  req.end( function( err, res ){
    if( err ) return cb( err );
    if( res.text.indexOf( "error" ) > -1 ) cb( "Authentication Error. Check user, password and security token. " + res.text );   
    var session = JSON.parse( res.text );
    return callback( null, session );
  });

}

gulp.task( "R2_LOGIN", function( cb ){
  if(!SalesforceLogin.setter) makeError('Variable setters not found, you can use R2 basic Setter or plugin you own');
      
  var user = SalesforceLogin.setter.get("USER");

  SalesforceLogin( user.salesforce_host, user.salesforce_user_name, user.salesforce_password + user.salesforce_token, function(err, session){
    if(err) return cb(err);

    SalesforceLogin.setter.set( "USER_SESSION", session );
    return cb();
  });

});

function makeError(err){
  throw new PluginError({
    plugin: 'R2-SALESFORCE-LOGIN',
    message: err
  });
}

module.exports = SalesforceLogin;