var fs          = require('fs');
var path        = require('path');
var through     = require('through2');
var gutil       = require('gulp-util');
var PluginError = gutil.PluginError;

var fs      = require("fs");
var Q       = require("q");
var request = require("superagent");

var gulp    = require("gulp");


function gulpVisualforceUpload(opts){

  return through.obj(function(file, enc, callback){

    if (file.isNull() || file.isDirectory()) {
        this.push(file);
        return callback();
    }

    if (['.html'].indexOf(path.extname(file.path)) === -1) {
        throw new PluginError({
            plugin: 'R2-VFUPLOAD',
            message: 'Supported formats include HTML and PAGE only.'
        });
        return callback();
    }

    // No support for streams
    if (file.isStream()) {
        throw new PluginError({
            plugin: 'R2-VFUPLOAD',
            message: 'Streams are not supported.'
        });
        return callback();
    }

    if (file.isBuffer()) {
      var _this= this;
      

      var name = opts.name
      if(opts.development) name += "_dev"

      var url  = opts.session.instance_url + "/services/data/v30.0/sobjects/ApexPage/Name/" + name; 
      var page = file.contents.toString();

      body = {
        Markup : page,
        ControllerType : 3,
        MasterLabel: name,
        ApiVersion: opts.apiVersion || "30.0"
      }

      var req = request.patch( url )
      .type( "application/json" )
      .set( 'Authorization', 'Bearer ' + opts.session.access_token )
      .send( body )
      .end( function( err, res ){
        gulpVisualforceUpload.lastResult = false;
        if( err ){
          throw new PluginError({
            plugin: 'R2-VFUPLOAD',
            message: err.toString()
          });
          return callback();
        }

        if( res.body[0] && res.body[0].errorCode ){
          throw new PluginError({
            plugin: 'R2-VFUPLOAD',
            message: "Salesforce.com rejected the upsert of a Visualforce Page with the HTML we send, it's posibly due to unvalid HTML. Please review your file. ERROR: " + res.body[0].message 
          });
          return callback();

        }
        if( res.body.success == false || res.body.errorCode ){
          throw new PluginError({
            plugin: 'R2-VFUPLOAD',
            message: "ERROR: " + JSON.stringify( res.body )
          });
          return callback();
        }


        gulpVisualforceUpload.lastResult = true;
        _this.push(file);
        return callback();
      })
         
    }
  });
}

module.exports = gulpVisualforceUpload;
gulpVisualforceUpload.lastResult = null;
