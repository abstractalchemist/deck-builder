const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const connect = require('gulp-connect');
const mocha = require('gulp-mocha');
const uglify = require('gulp-uglify')
const envify = require('gulp-envify')
gulp.task('test', function() {
    return gulp.src('./test/**/*.js').pipe(mocha({require:'test/setup.js', compilers: ['js:babel-register']}));
})

gulp.task('js', ['test'], function() {
    return browserify('./src/index.js', { debug: true })
	.transform('babelify')
	.bundle()
    	.on('error', function(err) {
	    console.log(err);
	    return this.emit('end');
	})
	.pipe(source('bundle.js'))

	.pipe(gulp.dest('build'));
})

gulp.task('connect', ['js', 'cp'], function() {
    return connect.server({ root : 'build', livereload : true });
})

gulp.task('js-production', function() {
    return browserify('./src/index.js')
	.transform('babelify')
	.bundle()
    	.on('error', function(err) {
	    console.log(err);
	    return this.emit('end');
	})
	.pipe(envify({NODE_ENV:'production'}))
	.pipe(source('bundle.js'))

	.pipe(gulp.dest('build'));
})

gulp.task('cp', function() {
    return gulp.src(['public/index.html','public/welcome.png','public/public.css']).pipe(gulp.dest('build'));
})

gulp.task('build', ['js','cp']);

gulp.task('default',['js', 'cp'], function() {
    

    const w = gulp.watch(['src/**/*.js','test/**/*.js','public/*css'], ['js','cp']);
    w.on('error', function(err) {
	console.log(err);
    })

})
