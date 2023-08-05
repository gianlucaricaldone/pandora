var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();
require('dotenv').config();
const ccxt = require('ccxt');

const binanceClient = new ccxt.binance({
  apiKey: process.env.API_ENV,
  secret: process.env.API_SECRET
});

var indexRouter = require('./routes/index');


const CandelaController = require('./controllers/candela_controller.js');
const candelaController = new CandelaController();

const PandoraController = require('./controllers/pandora_controller.js');
const pandoraController = new PandoraController();

const utils = require('./controllers/utils.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


function startStreamBinance(pairs) {
  const { Console } = require('console');
  logger = new Console({ stdout: process.stdout, stderr: process.stderr });
  const WebsocketStream = require('@binance/connector/src/websocketStream');
  const callbacks = {
    open: () => {
      logger.debug('Connected with Websocket server');
    },
    close: () => {
      logger.debug('Disconnected with Websocket server');
    },
    message: data => {
      // logger.info(data);
      aggiungiRigaFlussoBinance(data);
    }
  };
  const websocketStreamClient = new WebsocketStream({logger, callbacks, combinedStreams: true });
  websocketStreamClient.kline(pairs, '1m');
}

async function aggiungiRigaFlussoBinance(params) {
  const start = Date.now();

  data = JSON.parse(params);
  if (data.data.k.x == true) {
    
    // const balances = await binanceClient.fetchBalance();
    // console.log('balances');
    // console.log(balances.free['LUNA']);

    // console.log(data);
    candelaController.insertCandela(data.data.k, function(err, result) {
      // console.log(result);
      // console.log(err);
      console.log('INSERT >> OK');
    });


    pandoraController.canCandelaGeneraOrdine(data.data.k, function (err, result) {
      // console.log(result);
      const end = Date.now();
      console.log(`Execution time: ${end - start} ms\n\n`);
    });
  }
}




startStreamBinance(utils.pairs);

module.exports = app;
