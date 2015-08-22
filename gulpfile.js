var elixir        = require('laravel-elixir');
var gulp          = require('gulp');
var templateCache = require('gulp-angular-templatecache');

gulp.task('cacheTemplates', function () {
    gulp.src('assets/js/templates/**/*.html')
        .pipe(templateCache())
        .pipe(gulp.dest('build/js'));
});

elixir(function(mix) {
    mix.sass('./assets/sass/main.scss', 'build/css')
        .browserify('app.js', 'build/js', 'assets/js')
        .task('cacheTemplates', 'assets/js/templates/**/*.html');
});
