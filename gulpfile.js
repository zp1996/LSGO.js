const gulp = require("gulp"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	jshint = require("gulp-jshint"),
	path = "./LSGO.js";

gulp.task("default", () => {
	return gulp.src(path)
						 .pipe(jshint())
						 .pipe(uglify())
						 .pipe(rename("./lib/lsgo.min.js"))
						 .pipe(gulp.dest('./'));
});

gulp.watch(path, ["default"]);
