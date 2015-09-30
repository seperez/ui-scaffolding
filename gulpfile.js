var path = require('path'),
    gulp = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    mkdirp = require('mkdirp'),
    $ = require('gulp-load-plugins')(),

    src = {
        'build':{
            'root': 'ui-build/',
            'styles': 'ui-build/',
            'scripts': 'ui-build/',
            'images': 'ui-build/images/',
            'fonts': 'ui-build/fonts/'
            // 'tmpl': 'ui-build/tmpl/'
        },
        'dist':{
            'root': 'ui-dist/',
            'styles': 'ui-dist/',
            'scripts': 'ui-dist/',
            'images': 'ui-dist/images/',
            'fonts': 'ui-dist/fonts/',
            'manifest': 'ui-dist/'
        }
    },

    bundles = require('./config/bundles');

//Tasks for build

// gulp.task('tmplBuild', function() {
//     mkdirp(src.build.tmpl);
//
//     Object.keys(bundles.tmpl).forEach(function(bundle) {
//         return gulp.src(bundles.tmpl[bundle])
//             .pipe($.handlebars())
//             .pipe($.wrap('Handlebars.template(<%= contents %>)'))
//             .pipe($.declare({
//                 namespace: '__templates',
//                 noRedeclare: true,
//             }))
//             .pipe($.concat(bundle + 'Tmpl.js'))
//             .pipe($.size({
//                 title: 'Templates size:'
//             }))
//             .pipe(gulp.dest(src.build.tmpl));
//     });
// });

gulp.task('jsLinting', function() {
    gulp.src(['./src/**/*.js', './tests/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
});

gulp.task('jsBuild', function() {
    setTimeout(function(){
        Object.keys(bundles.js).forEach(function(bundle) {
            return gulp.src(bundles.js[bundle])
                .pipe($.plumber())
                .pipe($.concat(bundle + '.js'))
                .pipe($.size({
                    title: bundle + '.js size: '
                }))
                .pipe(gulp.dest(src.build.scripts));
        });
    },1000);
});

gulp.task('cssBuild', function() {
    Object.keys(bundles.css).forEach(function(bundle) {
        return gulp.src(bundles.css[bundle])
            .pipe($.plumber())
            .pipe($.sass({
                style: 'expanded'
            }))
            .pipe($.postcss([
                require('autoprefixer-core')({
                    browsers: ['last 5 versions', 'android >= 2.1', '> 1%']
                })
            ]))
            // .pipe($.replace('../assets/', '/build/fonts/'))
            .pipe($.concat(bundle + '.css'))
            .pipe($.size({
                title: bundle + '.css size: '
            }))
            .pipe(gulp.dest(src.build.styles));
    });
});

gulp.task('imageBuild', function() {
    mkdirp(src.build.images);

    //Vendor Images
    if(bundles.images.length > 0){
        gulp.src(bundles.images)
            .pipe(gulp.dest(src.build.images))
    }

    //App Images
    return gulp.src(['./src/images/**/*.+(png|gif|jpg|svg)'])
        // .pipe($.imageOptimization({
        //     progressive: true,
        //     interlaced: true
        // }))
        .pipe($.size({
            title: 'Images size:'
        }))
        .pipe(gulp.dest(src.build.images))
});

gulp.task('fontBuild', function() {
    mkdirp(src.build.fonts);

    //Vendor Fonts
    if(bundles.fonts.length > 0){
        gulp.src(bundles.fonts)
            .pipe(gulp.dest(src.build.fonts))
    }

    //App Fonts
    gulp.src('./src/fonts/**/*.+(eot|svg|ttf|woff)')
        .pipe(gulp.dest(src.build.fonts))

});

gulp.task('cleanBuild', function() {
    del.sync([src.build.root + '*'], { force: true });
});

//Tasks for dist
gulp.task('jsDist', function() {
    return gulp.src(src.build.scripts + '*.js')
        .pipe($.foreach(function(stream, file){
            var fileName = path.basename(file.path, '.js');

            return stream
                .pipe($.uglify())
                .pipe($.size({
                    title: fileName + '.js minified size: '
                }))
                .pipe(gulp.dest(src.dist.scripts));
        }));
});

gulp.task('cssDist', function() {
    return gulp.src(src.build.styles + '*.css')
        .pipe($.foreach(function(stream, file){
            var fileName = path.basename(file.path, '.css');

            return stream
                .pipe($.replace('/build/fonts/', '//myaccount.mlstatic.com/messaging/fonts/'))
                .pipe($.postcss([
                    require('cssnano')({
                        autoprefixer: false
                    })
                ]))
                .pipe($.size({
                    title: fileName + '.css minified size: '
                }))
                .pipe(gulp.dest(src.dist.styles));
        }));
});

gulp.task('imageDist', function() {
    mkdirp(src.dist.images);

    return gulp.src(src.build.images)
    .pipe(gulp.dest(src.dist.images));
});

gulp.task('fontDist', function() {
    mkdirp(src.dist.fonts);

    return gulp.src(src.build.fonts + '*.+(eot|svg|ttf|woff)')
        .pipe(gulp.dest(src.dist.fonts));
});

gulp.task('revisionDist',function(){
    gulp.src(src.dist.root + '*')
        .pipe($.rev())
        // .pipe($.gzip())
        .pipe(gulp.dest(src.dist.root))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(src.dist.root));
});

gulp.task('cleanDist', function() {
    del.sync([src.dist.root], { force: true });
});

//Public Tasks
gulp.task('build',function(){
    runSequence(
        'cleanBuild',
        // ['urls','i18n','tmplBuild'],
        ['fontBuild'],
        'cssBuild',
        'jsBuild'
    );
});

gulp.task('dist',function(){
    runSequence(
        'cleanDist',
        ['jsDist', 'cssDist'],
        ['fontDist'],
        'revisionDist'
    );
});

gulp.task('watch', function() {
    gulp.start('build');
    gulp.watch(['./src/styles/**/*.scss'], ['cssBuild']);
    gulp.watch(['./src/images/**/*'], ['imageBuild']);
    gulp.watch([
        'gulpfile.js',
        './config/*.js',
        './src/**/*.js'
        // './grails-app/templates/*.hbs',
        // 'mocks/mock.js'
    ], function(){
        runSequence(
            // 'tmplBuild',
            'jsBuild'
        );
    });
});
