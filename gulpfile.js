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

gulp.task('annotate', function () {
    return gulp
        .src(pkg.paths.js)
        .pipe(plug.ngAnnotate(pkg.pluginConfig.ngAnnotate))
        .pipe(gulp.dest(pkg.paths.client + 'app'));
});

gulp.task('js', ['analyze', 'templatecache', 'annotate'], function() {
    var dest = getDestination() + 'static/rev',
        sources = [].concat(pkg.paths.js, getDestination() + pkg.filename.templatesjs);
    return gulp
        .src(sources)
        .pipe(plug.concat(pkg.filename.js))
        .pipe(plug.uglify(pkg.pluginConfig.uglify))
        .pipe(gulp.dest(dest));
});

gulp.task('vendorjs', function() {
    var dest = getDestination() + 'static/rev';
    return gulp
        .src(pkg.paths.vendor.js)
        .pipe(plug.concat(pkg.filename.vendorjs))
        .pipe(gulp.dest(dest));
});

gulp.task('css', function() {
    var dest = getDestination() + 'static/rev';
    return gulp
        .src(pkg.paths.sass)
        .pipe(compass(pkg.pluginConfig.compass))
        .pipe(plug.sourcemaps.init())
        .pipe(plug.minifyCss(pkg.pluginConfig.minifyCss))
        .pipe(plug.sourcemaps.write())
        .pipe(gulp.dest(dest));
});

gulp.task('vendorcss', function() {
    var dest = getDestination() + 'static/rev';
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

gulp.task('rev', ['css', 'vendorcss', 'js', 'vendorjs'], function () {
    var dest = getDestination();

    return gulp
        .src(dest + 'static/rev/*')
        .pipe(plug.rev())
        .pipe(gulp.dest(dest + 'static/rev'))
        .pipe(plug.rev.manifest())
        .pipe(gulp.dest(dest));
});

gulp.task('inject', ['rev'], function () {
    var dest = getDestination();

    return gulp
        .src(pkg.paths.client + 'index.html')
        .pipe(inject('./static/rev/app.css'))
        .pipe(inject('./static/rev/all.min.js'))
        .pipe(inject('./static/rev/vendor.min.css', 'inject-vendor'))
        .pipe(inject('./static/rev/vendor.min.js', 'inject-vendor'))
        .pipe(gulp.dest(dest));

    function inject (path, name) {
        var fullPath = dest + path,
            options = {
                read: false,
                ignorePath: pkg.paths.staging.substring(1)
            };
        if (name) {
            options.name = name;
        }

        return plug.inject(gulp.src(fullPath), options);
    }
});

gulp.task('injectRev', ['inject'], function () {
    var dest = getDestination(),
        manifest = gulp.src(dest + 'rev-manifest.json');

    return gulp
        .src(dest + 'index.html')
        .pipe(plug.revReplace({manifest: manifest}))
        .pipe(gulp.dest(dest));
});

gulp.task('clean', function() {
    del(pkg.paths.build);
});

gulp.task('watch', function() {
    gulp
        .watch(pkg.paths.sass, ['css'])
        .on('change', logger);

    gulp
        .watch(pkg.paths.js, ['analyze'])
        .on('change', logger);

    function logger(event) {
        log('*** File ' + event.path + ' was ' + event.type + ', running tasks...');
    }
});

gulp.task('test', function () {
    // Todo implement testing
});

gulp.task('dev', ['annotate'], function() {
    serve({
        mode: 'development'
    });
});

gulp.task('staging', ['injectRev', 'images', 'fonts'], function() {
    serve({
        mode: 'staging'
    });
});

gulp.task('production', function() {
    // Todo implement production task
    serve({
        mode: 'production'
    });
});

function log(text) {
    console.log(text);
}

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