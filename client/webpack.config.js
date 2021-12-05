const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: './dist'
        },
        hot: true,
        port: 9000
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            'title': 'Entendió',
            'hash': true,
            'template': './src/index.html'
        }),
        new ForkTsCheckerWebpackPlugin({
            async: false,
        }),
    ],
    output: {
        filename: 'static/[name][hash].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};