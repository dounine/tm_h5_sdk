const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: './src/index.js',//入口文件 即一般来说app.js
    mode: "development",//生产环境
    output: {
        path: path.resolve(__dirname, 'build'),//输出路径
        library: "TMSDK",// 在全局变量中增加一个library变量
        libraryTarget: "window",
        filename: 'index.js'//输出后的文件名
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new WebpackObfuscator ({
            rotateStringArray: true
        })
    ]
};