let promise = require('bluebird');
let jwt     = require('jsonwebtoken');
let options = { promiseLib: promise };
let pgp = require('pg-promise')(options);


let emailAuthConf = {
  user: '1001kurort@gmail.com',
  pass: 'piramida2016'
}

let dbConfig;

if(process.env.NODE_ENV !== 'production'){
 dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '1'
  };
}
else {
 dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'chingis',
    user: 'admin_geoadmin',
    password: 'chingis'
  };
}

let db = pgp(dbConfig);

//token config
let tokenConfig = {
  'secret': 'ngEurope rocks!',
  'audience': 'nodejs-jwt-auth',
  'issuer': 'https://gonto.com'
}

module.exports = {
  db,
  tokenConfig,
  emailAuthConf,
}