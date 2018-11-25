const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './client/src/index.js',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './static',
        hot: true,
        port: 9000
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            'title': 'Basic Webpack Hot Reloading Setup',
            'hash': true,
            'template': 'client/src/index.html'
        })
    ],
    output: {
        filename: 'static/[name].bundle.js',
        path: path.resolve(__dirname, 'static')
    }
};