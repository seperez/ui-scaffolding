var js, css,
    _ = require('lodash');
    defaults = require('./defaults.resources'),

js = {};

css = {
    'mobile': defaults.mobile.css
};

fonts = ['node_modules/navigations/dist/*.{ttf,woff,eof,svg}'];

images = _.flatten([]);

exports.js = js;
exports.css = css;
exports.fonts = fonts;
exports.images = images;
