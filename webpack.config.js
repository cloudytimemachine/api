module.exports = {
     entry: {
        main: './src/main/main.js',
        capture:  './src/capture/capture.js'
     },
     output: {
         path: './public/bin',
         filename: 'app.[name].js',
     },
     module: {
         loaders: [{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader',
             query:
             {
              presets:['react','es2015']
             }
         }]
     }
 }
