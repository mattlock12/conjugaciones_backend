// Babel picks its environment from NODE_ENV, which webpack's `mode` doesn't set
// for the build process itself. Left unset, Babel assumes development and
// @babel/preset-react emits jsxDEV calls, which React's production build lacks
// ("jsxDEV is not a function").
process.env.NODE_ENV = 'production';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    output: {
        clean: true
    }
});
