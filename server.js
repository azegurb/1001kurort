var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var crontab = require('node-crontab');
var axios = require('axios');
var fs = require("fs");
var SitemapGenerator = require('sitemap-generator');
var bodyParser = require('body-parser');
var { Server } = require('http');
var express = require('express')
var path = require('path');
var cookieParser = require('cookie-parser');
var compression = require("compression");
var config;

const port = process.env.PORT || 3000;
const app = express();
const server = Server(app);

// react-spinkit lib for server-side rendering
process.env.REACT_SPINKIT_NO_STYLES = true;


// INCLUDE WEBPACK CONFIG
console.log(process.env.NODE_ENV)

if(process.env.NODE_ENV === 'production'){
  app.use(compression());

  config = require('./webpack.prod.config')
}
else{
  config = require('./webpack.config')
}


var compiler = webpack(config)

app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
app.use(webpackHotMiddleware(compiler))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(cookieParser());

// INIT NAVIGATOR FOR MATERIAL UI
global.navigator = { userAgent: 'all' };

// CONFIG SOCKETS FOR ONLINE USERS COUNT
var io = require('socket.io').listen(server);

var $ipsConnected = [],
    count = 0;

io.on('connection', function (socket) {
  var $ipAddress = socket.handshake.address;

  if (!$ipsConnected.hasOwnProperty($ipAddress)) {
    $ipsConnected[$ipAddress] = 1;
    ++count;
    socket.emit('count', {online: count });
  }

  socket.on('disconnect', function() {
   if ($ipsConnected.hasOwnProperty($ipAddress)) {
      delete $ipsConnected[$ipAddress];
      count--;
      socket.emit('count', {online: count });
    }
  });
});

// CRON TASKS FOR UPDATE CURRENCIES RATES
var jobId = crontab.scheduleJob("0 0 * * *", function(){
    
    console.log('TIME TO UPDATE CURRENCIES RATES: ' + new Date())
    
    fetch('http://www.floatrates.com/daily/usd.json')
      .then(res => res.json())
      .then(currencyRates => {

        console.log('CURRENT RATES HAS BEEN UPDATED')

        axios
          .post(`${process.env.API_URL}/api/currencies-rates/update`, currencyRates)
          .catch( err => console.log(err))

      })
      .catch( err => console.log(err))    
    
});

// CRON TASKS FOR MONTH INVOICES FOR SANATORIUMS
var jobId = crontab.scheduleJob("0 1 3 * *", function(){
    console.log(new Date())
    axios.get(`${process.env.API_URL}/api/admin/invoices/new-month`)
});


// INCLUDE API
var api = require('./api/index')
app.use(api)

// GENERATING SITEMAP
var generator = SitemapGenerator('https://1001kurort.com', {
  maxDepth: 0,
  filepath: path.join(process.cwd(), 'sitemap.xml'),
  maxEntriesPerFile: 50000,
  stripQuerystring: true
});
 
// register event listeners
/*
generator.on('done', () => {
  console.log('sitemap created')
  // sitemaps created
});

// on error
generator.on('error', (error) => {
  console.log(error);
}); 

// start the crawler
generator.start();
*/
/////////////////////

app.get("/google82171fbe2c1a9eb8.html", function(req, res, next) {
  res.sendFile(__dirname + '/google82171fbe2c1a9eb8.html')
})

app.get("/robots.txt", function(req, res, next) {
  res.sendFile(__dirname + '/robots.txt')
})

app.get('/sitemap.xml', function(req, res) {
  res.sendFile(__dirname + '/sitemap.xml')
});

app.get("*", require('./client').serverMiddleware );


server.listen(port,function(error) {  
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port )
  }
})
