'use strict';

var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename')
;

gulp.task('default', function() {
	
	return gulp
	.src('src/*.js')
	.pipe(uglify({
		preserveComments: 'some'
	}))
	.pipe(rename({
		suffix: '.min'
	}))
	.pipe(gulp.dest('dist'))
	;
});
