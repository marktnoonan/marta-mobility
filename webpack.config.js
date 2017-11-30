const path = require('path');

module.exports = {
    entry: './js/main.js',
    output: {
        path: path.resolve(__dirname + '/wwwdocs/', 'dist'),
        filename: 'build.js'
    },
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]?[hash]',
                  publicPath: 'dist/'
                }
            }
        ]
    },
    resolve: {
    alias: {
        'vue$': 'vue/dist/vue.esm.js',
        'assets': path.resolve('wwwdocs/assets')
      }
    }
};