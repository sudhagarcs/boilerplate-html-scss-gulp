"use strict";

// Load plugins
const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cssnano = require("cssnano");
const del = require("del");
const concat = require("gulp-concat");
const eslint = require("gulp-eslint");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const uglify = require("gulp-uglify");

// Define Constants
const constant = {
  'SRC_PATH' : 'src',
  'SRC_HTML_PATH' : 'src/html',
  'SRC_CSS_PATH' : 'src/css',
  'SRC_JS_PATH' : 'src/js',
  'BUILD_PATH' : 'build',
  'BUILD_HTML_PATH' : 'build',
  'BUILD_CSS_PATH' : 'build/assets/css',
  'BUILD_JS_PATH' : 'build/assets/js'
};

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: constant.BUILD_PATH
    }
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean build assets
function cleanTask() {
  return del(constant.BUILD_PATH + '/**/*');
}

// CSS Concatination & Minification
function cssMinificationTask() {
  return gulp
    .src(constant.SRC_CSS_PATH + '/**/*.css')
    .pipe(plumber())
    .pipe(concat('app.min.css'))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest(constant.BUILD_CSS_PATH));
}

// JavaScript Concatination & Minification
function javascriptMinificationTask() {
  return gulp
    .src(constant.SRC_JS_PATH + "/**/*.js")
    .pipe(plumber())
    .pipe(babel({
      presets: [
        ['@babel/env', {
          modules: false
        }]
      ]
    }))
    .pipe(concat("app.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(constant.BUILD_JS_PATH));
}

// JavaScript Linting
function javascriptLintingTask() {
  return gulp
    .src(constant.SRC_JS_PATH + "/**/*.js")
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format());
} 

// Copy HTML
function copyHTMLTask() {
  return gulp.src(constant.SRC_HTML_PATH + "/*.html")
    .pipe(gulp.dest(constant.BUILD_HTML_PATH));
}

// Watch Changes
function watchTask() {
  gulp.watch(constant.SRC_CSS_PATH + "/**/*", cssMinificationTask);
  gulp.watch(constant.SRC_JS_PATH + "/**/*", javascriptMinificationTask);
  gulp.watch(constant.SRC_HTML_PATH + "/**/*.html", copyHTMLTask);
  gulp.watch(constant.SRC_PATH + "/**/*", browserSyncReload);
}

// Define complex task
const build = gulp.series(cleanTask, gulp.parallel(cssMinificationTask, javascriptMinificationTask, copyHTMLTask));
const watch = gulp.series(cleanTask, gulp.parallel(watchTask, browserSync));

// Exports task
exports.clean = cleanTask;
exports.css = cssMinificationTask;
exports.js = javascriptMinificationTask;
exports.jslint = javascriptLintingTask;
exports.html = copyHTMLTask;

exports.build = build;
exports.watch = watch;
exports.default = build;
