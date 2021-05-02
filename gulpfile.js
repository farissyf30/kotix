// Konfigurasi
const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const merge = require('merge-stream');
const clean = require('gulp-clean');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const fileinclude = require('gulp-file-include');
const { series } = require('gulp');

//compile scss into css
function style() {
    return gulp.src('./app/scss/**/*.scss')
    //.pipe(sass().on('error', sass.logError))
    .pipe(plumber({
    	errorHandler:function(err){
    		 notify.onError({
    		 	title : "Gulp error in " + err.plugin,
    		 	message : err.toString()
    		 	})(err)
    	}
    	}))
    .pipe(sass())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./app/css'))
    .pipe(gulp.dest('./.tmp/css'))
    .pipe(browserSync.stream());
}

function cleanBuild() {
    return gulp.src('dist', {read: false})
     .pipe(clean());
}

function jsOptimize() {
    return gulp.src([
        'app/js/main.js'
    ])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('.tmp/js'))
    .pipe(browserSync.stream());
}

function imgOptimize(){
    return gulp.src('app/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'))
    .pipe(gulp.dest('.tmp/images'))
}

function copyJs(){
    return gulp.src('app/js/**')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/js'))
    .pipe(gulp.dest('.tmp/js'))
}

function fonts() {
    return gulp.src('app/fonts/**')
    .pipe(gulp.dest('.tmp/fonts'));
}

function files(){
    return gulp.src(['app/**/*.html'])
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe(browserSync.stream());
}

function serve(cb) {
    browserSync.init({
        server: ['.tmp', 'app'],
        port: 3000
    });
    gulp.watch(['app/scss/**/*.scss'], style)
    gulp.watch(['app/js/**'], jsOptimize)
    gulp.watch(['app/**/*.html'], files);
    gulp.watch('./*.html').on('change',browserSync.reload);
    gulp.watch('./js/**/*.js').on('change', browserSync.reload);
    cb();
}

function browsersyncReload(cb){
    browsersync.reload();
    cb();
}

function deploy() {
    // optimasi css
    var cssOptimize = gulp.src('app/css/*.css')
    .pipe(cssnano())
    //  .pipe(gutil.log('css Optimize Finish'))
    .pipe(gulp.dest('dist/css/'));
    
    var imgincss = gulp.src('app/css/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/css/images'))

// menggabung semua file js dan optimasi
    var jsOptimize = gulp.src([

        'app/js/main.js'
    ])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'));
    // optimasi image
    var imgOptimize = gulp.src('app/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'))

    // fonts folder
    var fonts= gulp.src('app/fonts/**')
    .pipe(gulp.dest('dist/fonts'));
    
    var jsfile= gulp.src('app/js/**')
    .pipe(gulp.dest('dist/js'));


    var html= gulp.src(['app/**.html'])
    .pipe(fileinclude({
    prefix: '@@',
    basepath: '@file'
    // basepath: 'app/'
    }))


    .pipe(gulp.dest('dist'));
    return merge(cssOptimize,jsOptimize,imgOptimize,fonts, html, jsfile, imgincss); 
}

exports.style = style;
exports.serve = series(files, jsOptimize, style, fonts, copyJs, serve);
exports.clean = cleanBuild;
exports.images = imgOptimize;
exports.js = copyJs;
exports.deploy = deploy;
