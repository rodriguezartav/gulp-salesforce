process.chdir( "./test/fixtures/clay_sf" );

var fs = require("fs");
var test = require('tape');
var gulp = require("gulp");

var r2 = require("../plugins/gulp-r2")

var glog = require('gulp-api-log');
glog(gulp);

var config = require("r2-config");


test('should transform all relative paths', function (t) {
  t.plan(7);

  gulp.task("R2_TRANSFORM_1", function(){

    return gulp.src([ './src/*.html'] ) 
    .pipe(r2.transform({ name: "APP_NAME_VERSION", sf: true }))     
    .pipe( gulp.dest( config.get("build.folder") ))
 
  });  

  gulp.task("R2_TRANSFORM_2", ["R2_TRANSFORM_1"], function(){
      var clay = '<script>';
      clay += 'window._sf = { staticResource: "{!URLFOR($Resource.APP_NAME_VERSION)}" };';
      clay += '\n window._sf.staticResource = window._sf.staticResource.path.split("?")[0]';
      clay +='</script></head>';
      
      var result = fs.readFileSync( config.localize( config.get("build.folder") ) + "/index.html" , "utf-8" );

      t.equal( result.indexOf('<link rel="stylesheet" href="{!URLFOR($Resource.APP_NAME_VERSION')>-1,true )
      t.equal( result.indexOf('<link rel="stylesheet" href="http://test')>-1,true )
      t.equal( result.indexOf('<link rel="stylesheet" href="https://test')>-1,true )
      t.equal( result.indexOf('<script src="{!URLFOR($Resource.APP_NAME_VERSION')>-1,true )
      t.equal( result.indexOf('<script src="http://test')>-1,true )
      t.equal( result.indexOf('<script src="https://test')>-1,true )

      t.equal( result.indexOf(clay)>-1,true )
  })

  gulp.start("R2_TRANSFORM_2");

});


