var gulp = require('gulp'),
    merge = require('merge-stream'),
    compass = require('gulp-compass'),
    pkg = require('./package.json'),
    plug = require('gulp-load-plugins')(),
    del = require('del');

gulp.task('analyze', function() {
    var jshint = analyzejshint([].concat(pkg.paths.js)),
        jscs = analyzejscs([].concat(pkg.paths.js));

    return merge(jshint, jscs);
});

gulp.task('templatecache', function() {
    var dest = getDestination();
    return gulp
        .src(pkg.paths.html)
        .pipe(plug.angularTemplatecache(pkg.filename.templatesjs, pkg.pluginConfig.angularTemplatecache))
        .pipe(gulp.dest(dest));
});

gulp.task('js', ['analyze', 'templatecache'], function() {
    var dest = getDestination() + 'static/js',
        sources = [].concat(pkg.paths.js, getDestination() + pkg.filename.templatesjs);
    return gulp
        .src(sources)
        .pipe(plug.concat(pkg.filename.js))
        .pipe(plug.ngAnnotate(pkg.pluginConfig.ngAnnotate))
        .pipe(plug.uglify(pkg.pluginConfig.uglify))
        .pipe(gulp.dest(dest));
});

gulp.task('vendorjs', function() {
    var dest = getDestination() + 'static/vendor/js';
    return gulp
        .src(pkg.paths.vendor.js)
        .pipe(plug.concat(pkg.filename.vendorjs))
        .pipe(gulp.dest(dest));
});

gulp.task('css', function() {
    var dest = getDestination() + 'static/css';
    return gulp
        .src(pkg.paths.sass)
        .pipe(compass(pkg.pluginConfig.compass))
        .pipe(plug.sourcemaps.init())
        .pipe(plug.minifyCss(pkg.pluginConfig.minifyCss))
        .pipe(plug.sourcemaps.write())
        .pipe(gulp.dest(dest));
});

gulp.task('vendorcss', function() {
    var dest = getDestination() + 'static/vendor/css';
    return gulp
        .src(pkg.paths.vendor.css)
        .pipe(plug.concat(pkg.filename.vendorcss))
        .pipe(plug.minifyCss(pkg.pluginConfig.minifyCss))
        .pipe(gulp.dest(dest));
});

gulp.task('images', function() {
    var dest = getDestination() + 'static/images';
    return gulp
        .src(pkg.paths.images)
        .pipe(plug.imagemin(pkg.pluginConfig.imagemin))
        .pipe(gulp.dest(dest));
});

gulp.task('fonts', function() {
    var dest = getDestination() + 'static/fonts';
    return gulp
        .src(pkg.paths.fonts)
        .pipe(gulp.dest(dest));
});

gulp.task('inject', ['css', 'vendorcss', 'js', 'vendorjs'], function () {
    var dest = getDestination();

    function inject (path, name) {
        var fullPath = getDestination() + path,
            options = {
                read: false,
                ignorePath: pkg.paths.staging.substring(1)
            };
        if (name) {
            options.name = name;
        }

        return plug.inject(gulp.src(fullPath), options);
    }
// TODO move this configuration to pkg.json
    return gulp
        .src(pkg.paths.client + 'index.html')
        .pipe(inject('./static/js/all.min.js'))
        .pipe(inject('./static/vendor/js/vendor.min.js', 'inject-vendor'))
        .pipe(inject('./static/css/app.css'))
        .pipe(inject('./static/vendor/css/vendor.min.css', 'inject-vendor'))
        .pipe(gulp.dest(dest));
});

gulp.task('clean', function() {
    del(pkg.paths.build);
});

gulp.task('watch', function() {
    // Todo add development watchers
});

gulp.task('dev', function() {
    serve({
        mode: 'development'
    });
});
gulp.task('staging', ['inject', 'images', 'fonts'], function() {
    serve({
        mode: 'staging'
    });
});
gulp.task('production', function() {
    // Todo implement production task
    // Todo implement rev resources
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
    var config = overrideConfig || pkg.paths.config.jshint;
    log('Running JSHint');

    return gulp
        .src(sources)
        .pipe(plug.jshint(config))
        .pipe(plug.jshint.reporter(pkg.pluginConfig.jshint));
}

function analyzejscs(sources, overrideConfig) {
    var config = overrideConfig || pkg.paths.config.jscs;
    log('Running JSCS');
    return gulp
        .src(sources)
        .pipe(plug.jscs(config));
}