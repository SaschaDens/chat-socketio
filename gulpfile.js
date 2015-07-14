var gulp = require('gulp'),
    merge = require('merge-stream'),
    compass = require('gulp-compass'),
    pkg = require('./package.json'),
    plug = require('gulp-load-plugins')();

// TODO ngAnnotate & uglify

gulp.task('analyze', function() {
    var jshint = analyzejshint([].concat(pkg.paths.js)),
        jscs = analyzejscs([].concat(pkg.paths.js));

    return merge(jshint, jscs);
});

gulp.task('templatecache', function() {
    // TODO add template cache
});

gulp.task('js', function() {
    var dest = getDestination();
    return gulp
        .src(pkg.paths.js)
        .pipe(plug.concat(pkg.filename.js))
        .pipe(plug.ngAnnotate(pkg.pluginConfig.ngAnnotate))
        .pipe(plug.uglify(pkg.pluginConfig.uglify))
        .pipe(gulp.dest(dest));
});

gulp.task('vendorjs', function() {
    var dest = getDestination() + 'vendor/js';
    return gulp
        .src(pkg.paths.vendorjs)
        .pipe(plug.concat(pkg.filename.vendorjs))
        .pipe(gulp.dest(dest));
});

gulp.task('css', function() {
    var dest = getDestination() + 'css';
    log('Compiling css');
    return gulp
        .src(pkg.paths.sass)
        .pipe(compass(pkg.pluginConfig.compass))
        .pipe(plug.sourcemaps.init())
        .pipe(plug.minifyCss(pkg.pluginConfig.minifyCss))
        .pipe(plug.sourcemaps.write())
        .pipe(gulp.dest(dest));
});

gulp.task('vendorcss', function() {
    var dest = getDestination() + 'vendor/css';
    log('Creating vendor css');
    return gulp
        .src(pkg.paths.vendorcss)
        .pipe(plug.concat(pkg.filename.vendorcss))
        .pipe(plug.minifyCss(pkg.pluginConfig.minifyCss))
        .pipe(gulp.dest(dest));
});

gulp.task('images', function() {
    var dest = getDestination() + 'images';
    log('Image optimization');
    return gulp
        .src(pkg.paths.images)
        .pipe(plug.imagemin(pkg.pluginConfig.imagemin))
        .pipe(gulp.dest(dest));
});

gulp.task('fonts', function() {
    var dest = getDestination() + 'fonts';
    log('Moving fonts');
    return gulp
        .src(pkg.paths.fonts)
        .pipe(gulp.dest(dest));
});

gulp.task('inject', function () {
    // TODO add dependencies
    var dest = getDestination() + 'index.html',
        sources = [].concat(getDestination() + '**/*.min.*');
    return gulp
        .src(pkg.paths.client + '/index.html')
        .pipe(inject(sources))
        .pipe(gulp.dest(dest));
});

gulp.task('clean', function() {});

gulp.task('watch', function() {});

gulp.task('dev', function() {
    serve({
        mode: 'development'
    });
});
gulp.task('staging', function() {
    serve({
        mode: 'staging'
    });
});
gulp.task('production', function() {
    serve({
        mode: 'production'
    });
});

function log(text) {
    console.log(text);
};

function getDestination() {
    return pkg.paths.staging;
}

function serve(args) {
    var options = {
        script: pkg.paths.server + 'app.js',
        delayTime: 1,
        ext: 'html js',
        env: {
            'NODE_ENV': args.mode
        },
        watch: [
            'gulpfile.js',
            'package.json',
            pkg.paths.server,
            pkg.paths.client
        ]
    };

    return plug.nodemon(options)
        .on('restart', function() {
            console.log('Nodemon: restarted');
        });
}

function analyzejshint(sources, overrideConfig) {
    var config = overrideConfig || './.jshintrc';
    log('Running JSHint');

    return gulp
        .src(sources)
        .pipe(plug.jshint(config))
        .pipe(plug.jshint.reporter('jshint-stylish'));
}

function analyzejscs(sources) {
    log('Running JSCS');

    return gulp
        .src(sources)
        .pipe(plug.jscs('./.jscsrc'));
}