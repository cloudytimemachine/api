module.exports = {
     entry: './src/main.js',
     output: {
         path: './public/bin',
         filename: 'app.bundle.js',
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
