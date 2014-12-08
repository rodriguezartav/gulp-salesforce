var fs          = require('fs');
var path        = require('path');
var through     = require('through2');
var gutil       = require('gulp-util');
var PluginError = gutil.PluginError;

var cheerio = require("cheerio");


function gulpVisualforceHtml(opts){

  return through.obj(function(file, enc, callback){

    var claysf = '<script>';
    claysf += 'window._sf = { staticResource: "{!URLFOR($Resource.APP_NAME_VERSION)}" };';
    claysf += '\n window._sf.staticResource = window._sf.staticResource.path.split("?")[0]';
    claysf +='</script></head>';

    var clay = '<script>';
    if(opts.prefix) clay += 'window._clay = { path: "' +  opts.prefix  + '" }';
    else if( opts.clay ==true ) clay += 'window._clay = {CLAY}';
    else  clay += 'window._clay = { path: document.location.href.split("?")[0].split["#"][0] }';
    clay +='</script></head>';


    // Pass file through if:
    // - file has no contents
    // - file is a directory
    if (file.isNull() || file.isDirectory()) {
        this.push(file);
        return callback();
    }
    // User's should be using a compatible glob with plugin.
    // Example: gulp.src('images/**/*.{jpg,png}').pipe(watermark())
    if (['.html'].indexOf(path.extname(file.path)) === -1) {
      throw new PluginError({
        plugin: 'R2-VFTRANSFORM',
        message: 'Supported formats include HTML and PAGE only.'
      });
      return callback();
    }

    // No support for streams
    if (file.isStream()) {
      throw new PluginError({
        plugin: 'R2-VFTRANSFORM',
        message: 'Streams are not supported.'
      });
      return callback();
    }

    if (file.isBuffer()) {
        
      try{

        var cheerio = require('cheerio'),
        $ = cheerio.load( file.contents.toString(),  { xmlMode: true });

        if(opts.r2 != false && !opts.sf) $("head").append(clay);
        else if(opts.r2 != false && opts.sf) $("head").append(claysf);

        if( opts.sf ){

          $("link").each(function(i, elem) {
            var el = $(this)
            var url = el.attr("href");
            url = url.replace("{3vot}/", "");

            if(url && url.indexOf("http") !=0 ){
              var transformed = "{!URLFOR($Resource." + opts.name + ", '" +url +"')}"
              el.attr("href", transformed);
            }   
          });

          $("script").each(function(i, elem) {
            var el = $(this)
            var url = el.attr("src");
            if(url){
              url = url.replace("{3vot}/", "");
              if(url && url.indexOf("http") !=0  ){
                var transformed = "{!URLFOR($Resource." + opts.name + ", '" +url +"')}"
                el.attr("src", transformed);
                el.html(";");
              }
            }
          });
        }

        this.push(file);
        file.contents = new Buffer( $.xml() );
      }catch(e){ 
        throw new PluginError({
          plugin: 'R2-VFTRANSFORM',
          message: 'Transform Error' + e
        });
        return callback();
      }
    }
    return callback();
  });

}

module.exports = gulpVisualforceHtml;
