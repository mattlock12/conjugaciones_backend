const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
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
                    loader: 'babel-loader',
                    options: {
                        plugins: ['react-refresh/babel']
                    }
                }
            }
        ]
    },
    plugins: [
        new ReactRefreshWebpackPlugin(),
    ],
    output: {
        // contenthash is incompatible with HMR
        filename: 'static/[name].bundle.js'
    }
});
