let source  = '_source';
    dist    = require('path').basename(__dirname);

    path = {
      build:{
        html:   dist + '/',
        php:    dist + '/',
        css:    dist + '/css/',
        js:     dist + '/js/',
        img:    dist + '/img/',
        fonts:  dist + '/fonts/',
      },
      src:{
        html:[ source + '/*.html', '!' + source + '/_*.html'],
        php:   source + '/*.php',
        css:   source + '/sass/main.sass',
        js:    source + '/js/*.js',
        img:   source + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: source + '/fonts/**/*.ttf',
      },
      watch:{
        html:  source + '/**/*.html',
        css:   source + '/sass/**/*.sass',
        js:    source + '/js/**/*.js',
        img:   source + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
      },
      clean: "./" + dist + "/"
    }


let {src, dest}   = require('gulp'),
    gulp          = require('gulp'),
    browsersync   = require('browser-sync').create();
    fileinclude   = require('gulp-file-include');
    del           = require('del');
    sass          = require('gulp-sass');
    autoprefixer  = require('gulp-autoprefixer');
    group_media   = require('gulp-group-css-media-queries');
    clean_css     = require('gulp-clean-css');
    rename        = require('gulp-rename');
    uglify        = require('gulp-uglify-es').default;
    babel         = require('gulp-babel');
    imagemin      = require('gulp-imagemin');
    ttf2woff      = require('gulp-ttf2woff');
    ttf2woff2     = require('gulp-ttf2woff2');
    fs            = require('fs');





function browserSync() {
  browsersync.init({
    server:{
      baseDir:  "./" + dist + "/"
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}
function php() {
  return src(path.src.php)
    .pipe(dest(path.build.php))
}
function css() {
  return src(path.src.css)
    .pipe(sass())
    .pipe( autoprefixer({ overrideBrowserslist: ['last 5 versions'],  cascade:true }))
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(rename({extname: '.min.css'}))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(babel())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename( {extname: '.min.js' }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
    }))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

function fontsStyle() {
  let file_content = fs.readFileSync(source_folder + '/sass/fonts.sass');
  if(file_content == ''){
    fs.writeFile(source_folder + '/sass/fonts.sass', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if(c_fontname != fontname){
            fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}

function cb() {

}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);

}

function clean() {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, php, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle    = fontsStyle;fontsStyle
exports.fonts         = fonts;
exports.images        = images;
exports.js            = js;
exports.css           = css;
exports.html          = html;
exports.build         = build;
exports.watch         = watch;
exports.default       = watch;
