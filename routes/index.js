var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  startTime = new Date();

  // client.account().then(response => {
  //   client.logger.log(response.data);
  //   stopTimer(startTime);
  // });

  // client.klines('BTCUSDT', '1m', { limit: 5 }).then(response => {
  //   stopTimer(startTime);
  //   client.logger.log(response.data);
  // })
  // .catch(error => client.logger.error(error.message))

  const logger = new Console({ stdout: process.stdout, stderr: process.stderr });
  const callbacks = {
    open: () => logger.debug('Connected with Websocket server'),
    close: () => logger.debug('Disconnected with Websocket server'),
    message: data => logger.info(data)
  };
  const websocketStreamClient = new WebsocketStream({ logger, callbacks, combinedStreams: true })
  websocketStreamClient.kline('btcusdt', '1m');

  // setTimeout(() => websocketStreamClient.unsubscribe('bnbusdt@kline_1m'), 6000)
  // setTimeout(() => websocketStreamClient.disconnect(), 12000)

  res.render('index', { title: 'Pandora' });
});

function stopTimer(startTime) {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  // strip the ms
  // timeDiff /= 1000;

  // get seconds 
  var seconds = Math.round(timeDiff);
  console.log(timeDiff + " ms");
}


module.exports = router;
