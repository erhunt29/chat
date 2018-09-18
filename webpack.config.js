const path = require('path');

module.exports = {
    entry: './src/components/login/login.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'src')
    },
    mode: 'development',
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/}
        ]
    }
}
