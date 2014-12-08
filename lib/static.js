'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var chalk = require('chalk');
var JSZip = require('jszip');
var Q = require("q");

var jsforce = require("jsforce")

module.exports = function (filename, opts) {
  if(!opts) opts = {}
  opts.namespace = opts.namespace || "";

  if (!filename) {
    throw new gutil.PluginError('gulp-zip', chalk.blue('filename') + ' required');
  }

  opts = opts || {};
  opts.compress = typeof opts.compress === 'boolean' ? opts.compress : true;

  var firstFile;
  var zip = new JSZip();

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb();
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-zip', 'Streaming not supported'));
      return;
    }

    if (!firstFile) {
      firstFile = file;
    }

    // because Windows...
    var pathname = file.relative.replace(/\\/g, '/');

    zip.file(pathname, file.contents, {
      date: file.stat ? file.stat.mtime : new Date(),
      createFolders: true
    });

    cb();
  }, function (cb) {
    if (!firstFile) {
      cb();
      return;
    }

    var zipContents = zip.generate({
        type: 'nodebuffer',
        compression: opts.compress ? 'DEFLATE' : 'STORE',
        comment: opts.comment
      });

    upload(zipContents, opts.namespace + opts.name, opts.session)
    .then( cb )
    .catch( cb )
    .fail( cb );

  });
};


function upload(content, name, session){
  var deffered = Q.defer();
  var zip64 =  new Buffer(content).toString('base64');
  var url = session.instance_url + '/services/data/v30.0/tooling/sobjects/StaticResource/'

  var conn = new jsforce.Connection({
    accessToken: session.access_token,
    instanceUrl: session.instance_url
  });

  var fullNames = [ {
    fullName: name,
    content: zip64,
    contentType: "application/zip", 
    cacheControl: "Public"  ,
    }
  ];

  conn.metadata.upsert('StaticResource', fullNames, function(err, results) {
    console.log(results)
    return deffered.resolve();
    if (err) throw new gutil.PluginError('gulp-zip', err.stack);
  });

  return deffered.promise;

}
