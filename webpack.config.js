const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');//动态创建html 插件
const webpack = require('webpack');
module.exports = {
    entry: './src/index.ts',
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, './dist')
    },
    resolve: {
        extensions: [".ts",'.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html' // 添加模版文件
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    mode: 'development',
    devServer: {
        contentBase: path.relative(__dirname, "./dist"),
        port: 2333,
        hot: true,
        host: '0.0.0.0',
    },
    devtool: 'cheap-module-eval-source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: "ts-loader"
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
            ]
        }]
    }
}