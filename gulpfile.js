const { src, dest, watch, parallel, series } = require('gulp')
const mode = require('gulp-mode')()
const del = require('del')
const debug = require('gulp-debug')
const changed = require('gulp-changed');

const browserSync = require('browser-sync').create()


const sass = require('gulp-sass')
sass.compiler = require('node-sass')
const autoprefixer = require('gulp-autoprefixer')
const cssnano = require('gulp-cssnano')

const imagemin = require('gulp-imagemin')

const rigger = require('gulp-rigger')

const babel = require('gulp-babel')

const clean = () => del('./dist/*')

const copy = () => src([
        './src/**/*',
        '!./src/**/*.html',
        '!./src/partials',
        '!./src/partials/**/*',
        '!./src/js',
        '!./src/js/**/*',
        '!./src/images',
        '!./src/images/**/*',
        '!./src/sass',
        '!./src/sass/**/*',
    ])
    .pipe(changed('./dist'))
    .pipe(debug({ title: 'Copying: ' }))
    .pipe(dest('./dist'))

const html = () => src([
        './src/**/*.html',
        '!./src/partials/**/*'
    ])
    .pipe(rigger())
    .pipe(changed('./dist', { hasChanged: changed.compareContents }))
    .pipe(debug({ title: 'Html processing: ' }))
    .pipe(dest('./dist'))

const css = () => src('./src/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(mode.production(autoprefixer()))
    .pipe(mode.production(cssnano()))
    .pipe(dest('./dist/css'))
    .pipe(browserSync.stream())

const js = () => src('./src/js/**/*.js')
    .pipe(babel())
    .pipe(dest('./dist/js'))

const images = () => src('./src/images/**/*')
    .pipe(changed('./dist/images'))
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
    ]))
    .pipe(dest('./dist/images'))

const sync = done => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    })
    done()
}

const serve = () => {
    watch('./src/**/*.html', html).on('change', browserSync.reload)
    watch('./src/sass/**/*.scss', css)
    watch('./src/js/**/*.js', js).on('change', browserSync.reload)
    watch('./src/images/**/*', images).on('change', browserSync.reload)
    watch('./src/fonts/**/*').on('change', browserSync.reload)
}

const build = parallel(copy, html, css, js, images)

exports.default = series(clean, build, sync, serve)
exports.build = series(clean, build)