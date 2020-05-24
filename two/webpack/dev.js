console.clear()

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const {exec} = require('child_process')

const webpackConfig = require('../webpack.config')
const compiler = webpack(webpackConfig)

let inited = false
compiler.hooks.done.tap('ProgressPlugin', (context, entry) => {
  console.clear()
  console.log(`\nServer running at : ${color('green,underline')(`http://localhost:${PORT}`)}\n`)
  !inited && (inited = true) && exec(`start chrome http://localhost:${PORT}`, () => {})
});

const express = require('express')
const app = express()

const path = require('path')
const color = require('./escape-color')

const {getPort, checkPort} = require('./get-port')

function getPropPort() {
  if (process.argv.indexOf('-p') === -1) return 0
  else return Number(process.argv[process.argv.indexOf('-p') + 1])
}
let PORT = getPropPort() ? getPropPort() : 8080

function runDevServer(app, port) {
  app.use(
    webpackDevMiddleware(compiler, {
      stats: 'minimal',
      historyApiFallback: true,
    })
  )
  
  app.use(
    webpackHotMiddleware(compiler)
  )

  app.use('*', (req, res, next) => { // https://github.com/jantimon/html-webpack-plugin/issues/145#issuecomment-170554832
    var filename = path.join(compiler.outputPath,'index.html');
    compiler.outputFileSystem.readFile(filename, (err, result) => {
      if (err) {
        return next(err);
      }
      res.set('content-type','text/html');
      res.send(result);
      res.end();
    });
  });  

  app.listen(port);
}

const main = async () => {
  try {
    await checkPort(PORT)
    runDevServer(app, PORT)
  } catch (e) {
    console.log(color('yellow')(`Warning: listen EADDRINUSE: address already in use :::${PORT}\n`))
    PORT = await getPort()
    runDevServer(app, PORT)
  }
}
main()