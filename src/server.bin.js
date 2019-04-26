#!/usr/bin/env node

'use strict'

process.env.NODE_ENV = 'development'

// run Webpack dev server programmatically
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfig = require('./webpack.config')()

webpackConfig.then(config => {
  // setup Webpack compiler
  const compiler = webpack({
    mode: 'production',
    ...config
  })
  const devServerOptions = Object.assign({}, config.devServer, {
    stats: { colors: true }
  })

  // start dev server
  const port = config.devServer.port
  const server = new WebpackDevServer(compiler, devServerOptions)
  server.listen(port, 'localhost', () => {
    console.log(`Starting server on http://localhost:${port}`)
  })
})
