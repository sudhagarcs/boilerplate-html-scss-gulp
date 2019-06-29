"use strict";

// Load plugins
const gulp = require("gulp");
const browsersync = require("browser-sync").create();
const del = require("del");
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const cleancss = require("gulp-clean-css");
const concat = require("gulp-concat");
const eslint = require("gulp-eslint");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");

// Define Constants
const constant = {
  SRC_PATH: "src",
  SRC_HTML_PATH: "src/html",
  SRC_SCSS_PATH: "src/scss",
  SRC_JS_PATH: "src/js",
  BUILD_PATH: "build",
  BUILD_HTML_PATH: "build",
  BUILD_CSS_PATH: "build/assets/css",
  BUILD_JS_PATH: "build/assets/js"
};

const sassOptions = {
  errLogToConsole: true,
  outputStyle: "expanded"
};

const prefixerOptions = {
  overrideBrowserslist: ["last 2 version", "> 1%"],
  cascade: false
};

// BrowserSync Init
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

// Task: Clean build assets
function cleanTask() {
  return del(constant.BUILD_PATH + "/**/*");
}

// Task: SCSS Compile & Minify
function cssTask() {
  return gulp
    .src(constant.SRC_SCSS_PATH + "**/*.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on("error", sass.logError))
    .pipe(autoprefixer(prefixerOptions))
    .pipe(rename("main.css"))
    .pipe(gulp.dest(constant.BUILD_CSS_PATH))
    .pipe(cleancss())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(constant.BUILD_CSS_PATH));
}

// Task: JS transpile, concat & minify
function jsTask() {
  return gulp
    .src(constant.SRC_JS_PATH + "/**/*.js")
    .pipe(plumber())
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false
            }
          ]
        ]
      })
    )
    .pipe(concat("app.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(constant.BUILD_JS_PATH));
}

// Task: JavaScript Linting
function jsLintingTask() {
  return gulp
    .src(constant.SRC_JS_PATH + "/**/*.js")
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format());
}

// Task: Copy HTML
function copyHTMLTask() {
  return gulp
    .src(constant.SRC_HTML_PATH + "/*.html")
    .pipe(gulp.dest(constant.BUILD_HTML_PATH));
}

// Task: Watch Changes
function watchTask() {
  gulp.watch(constant.SRC_SCSS_PATH + "/**/*", cssTask);
  gulp.watch(constant.SRC_JS_PATH + "/**/*", jsTask);
  gulp.watch(constant.SRC_HTML_PATH + "/**/*.html", copyHTMLTask);
  gulp.watch(constant.SRC_PATH + "/**/*", browserSyncReload);
}

const build = gulp.series(cleanTask, gulp.parallel(cssTask, jsTask));
const watch = gulp.series(cleanTask, gulp.parallel(watchTask, browserSync));

exports.jslint = jsLintingTask;
exports.watch = watch;
exports.build = build;
exports.default = build;
