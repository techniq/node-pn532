var gulp = require('gulp');
var esnext = require('gulp-esnext');

gulp.task('default', function () {
    return gulp.src('src/*.js')
        .pipe(esnext())
        .pipe(gulp.dest('dist'));
});
