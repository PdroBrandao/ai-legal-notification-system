const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './node_modules/.prisma/client/schema.prisma', to: './' },
      ],
    }),
  ],
}