const gulp = require("gulp"),
	uglify = require("gulp-uglify"),
	concat = require("gulp-concat"),
	rename = require("gulp-rename"),
	jshint = require("gulp-jshint"),
	path = `${__dirname}/src/**/*.js`;

gulp.task("default", () => {
	return gulp.src(path)
		.pipe(concat(path))
	 	.pipe(jshint())
	 	.pipe(uglify())
	 	.pipe(rename("./lib/lsgo.min.js"))
	 	.pipe(gulp.dest('./'));
});

gulp.watch(path, ["default"]);
