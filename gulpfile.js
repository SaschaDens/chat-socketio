var gulp = require('gulp'),
    merge = require('merge-stream'),
    pkg = require('./package.json'),
    plug = require('gulp-load-plugins')();

gulp.task('analyze', function() {
    var jshint = analyzejshint([].concat(pkg.paths.js)),
        jscs = analyzejscs([].concat(pkg.paths.js));

    return merge(jshint, jscs);
});

gulp.task('js', function() {});

gulp.task('vendorjs', function() {});

gulp.task('css', function() {
    var dest = getDestination() + 'css';
    log('Compiling css');
    return gulp
        .src('./src/resource/sass/app.scss')
        .pipe(compass(pkg.pluginConfig.compass))
        .pipe(plug.sourcemaps.init())
        .pipe(plug.minifyCss(pkg.pluginConfig.minifyCss))
        .pipe(plug.sourcemaps.write())
        .pipe(gulp.dest(dest));
});

gulp.task('vendorcss', function() {
    var dest = getDestination() + 'css';
    log('Creating vendor css');
    return gulp
        .src(pkg.paths.vendorcss)
        .pipe(plug.concat('vendor.min.css'))
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