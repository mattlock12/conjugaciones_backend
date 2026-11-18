const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    entry: './src/index.js',
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
        filename: 'static/[name].[contenthash].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};
