let promise = require('bluebird');
let _ = require('underscore');
let nodemailer = require('nodemailer');
let moment = require('moment');
let { extendMoment } = require('moment-range');
let momentRange = extendMoment(moment)
var fs = require('fs');
var JSON = require('JSON2');
var crypto = require('crypto');
var sha1 = crypto.createHash('sha1');
let jwt     = require('jsonwebtoken');
let axios = require('axios');

//db
const db = require(`../config`).db
const emailAuthConf = require(`../config`).emailAuthConf
const tokenConfig = require(`../config`).tokenConfig

const createEmail = require('../email/createEmail');

// tokens functions

function createIdToken(user) {
  console.log(user)
  return jwt.sign(user, tokenConfig.secret, { expiresIn: 60*60*5 });
}

function createAccessToken() {
  return jwt.sign({
    iss: tokenConfig.issuer,
    aud: tokenConfig.audience,
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    scope: 'full_access',
    sub: "lalaland|gonto",
    jti: genJti(), // unique identifier for the token
    alg: 'HS256'
  }, tokenConfig.secret);
}

// Generate Unique Identifier for the access token
function genJti() {
  let jti = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 16; i++) {
      jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return jti;
}


// get users ip-address
function getClientIp(req) {

  return (req.headers['x-forwarded-for'] || '').split(',')[0] 
    || req.connection.remoteAddress
};


// read html file
var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};


var hashObject = function (object) {
  var hash = crypto.createHash('md5')
    .update(JSON.stringify(object, function (k, v) {
      if (k[0] === "_") return undefined; // remove api stuff
      else if (typeof v === "function") // consider functions
        return v.toString();
      else return v;
    }))
    .digest('hex');
  return hash;
}

/////////////////////////////////////////////////////





function getAuth(req, res, next) {

  let query =  `SELECT  *
                FROM users u
                JOIN users_props p ON p.users_id = u.id
                WHERE 
                ${!req.query.auth_via 
                  ? ' email = $1 AND password = $2'
                : ' auth_via = $3 AND social_id = $4'}
                ${req.query.type 
                  ? ' AND account_type = $5' : ''}`

  let params = [req.query.email,req.query.password, req.query.auth_via, req.query.social_id, req.query.type]

  console.log(params, query)

  db.one( query, params )
    .then(function (data) {
      console.log(data)
      res.status(200)
        .send({
          status: 'success',
          id_token: createIdToken(data),
          access_token: createAccessToken()
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}



function getRegBanner(req,ip_address, email, code){

  let query = 'SELECT get_is_new_user($1, $2, $3) as new',
      params = [ip_address, email, code]
    
    db.one(query, params)   
     .then( is_new_user => {

        if(is_new_user.new){
          return db.one( `WITH ins1 AS (
                            INSERT INTO coupons (created, ip_address, users_email,code, coupon_type) 
                            VALUES (NOW()::timestamp, $1, $2, $3, 0) 
                            RETURNING *
                          )
                          SELECT ins1.*, c.percent_discount, c.valid_until 
                          FROM ins1
                          LEFT JOIN coupons_types c ON c.id = (SELECT coupon_type FROM ins1) `, params)
        }
    })
    .then( data => {

    if( data && data.id > 0 ){      

      createEmail({ 
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          coupon_percent: data.percent_discount,
          coupon_expiration: data.valid_until,
          coupon_code: data.code
        }, 'get-coupon' 
      ) 
      .then((email) => {

        let mailGetter = req.body.email,
            transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 465,
              secure: true,
              auth: emailAuthConf,
              tls: {
                rejectUnauthorized: false
              }
            }),
            mailOptions = {
              from: 'sales@1001kurort.com',
              to: mailGetter,
              subject: '1001Kurorts',
              html: email,
            }

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        })
          
      })
    }  

  })
}


function regAccount(req, res, next) {

  let query =`WITH ins1 AS (
                INSERT INTO users (
                  password,
                  email,
                  account_type,
                  auth_via,
                  social_id,
                  created
                ) 
                VALUES($1,$2,$3,$4,$5, NOW()::timestamp)
                RETURNING id as users_id
              )
              INSERT INTO users_props (
                users_id,
                first_name,
                last_name,
                phone,
                address,
                d_speciality_id,
                h_country_id,
                h_kurort_id,
                h_sname,
                h_sname_ru,
                h_website,
                h_stars,
                d_speciality,
                d_category
                ${ req.body.account_type == 2 ? ', d_coupon_code' : ''}
              ) 
              VALUES( (select users_id from ins1),$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18 ${ req.body.account_type === 2 ? ', $19' : '' })
              RETURNING id;    
              `,

      query2 = req.body.account_type !== 2 
                ? ';INSERT INTO events (type,ref_id,date) VALUES ($1, $2, NOW()::timestamp )'
                : ';',

      query3 = `
                SELECT  *
                  FROM users u
                  JOIN users_props p ON p.users_id = u.id
                  WHERE 
                    ${ 
                      !req.body.auth_via 
                      ? ' email = $2'
                      : ' auth_via = $4 AND social_id = $5'
                    }
                `,

      params = [
        req.body.password || '',
        req.body.email || '',
        req.body.account_type || 0,
        req.body.auth_via || '',
        req.body.social_id || 0,
        req.body.first_name || '',
        req.body.last_name || '',
        req.body.phone || '',
        req.body.adress || '',
        req.body.d_speciality_id || 0,
        req.body.h_country_id || 0,
        req.body.h_kurort_id || 0,
        req.body.h_sname || '',
        req.body.h_sname_ru || '',
        req.body.h_website || '',
        req.body.h_stars || 0,
        req.body.d_speciality || [],
        req.body.d_category || 0,
        hashObject({ email: req.body.email, reg: false })
      ]

  db.one( query, params )
    .then( () => { 
      return db.one( query3, params ) 
    })
    .then(function (data) {

      // создаем регистрационный купон и отсылаем на почту, если по IP не выдавался раньше
      getRegBanner( req, getClientIp(req), req.body.email, hashObject({ email: req.body.email, reg: true }) )

      if(req.body.email){

        createEmail({ 
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email || 'using social network',
          password: req.body.password || 'using social network',
          confirmLink: `${req.headers.origin}/account/confirm/` + req.body.email || req.body.social_id,
        }, 'reg-confirm' ) 
        .then((email) => {

          let mailGetter = req.body.email,
              transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: emailAuthConf,
                tls: {
                  rejectUnauthorized: false
                }
              }),
              mailOptions = {
                from: 'sales@1001kurort.com',
                to: mailGetter,
                subject: '1001Kurorts',
                html: email,
              }
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          })
            
        })    


      }



    res.status(200)
      .send({
        status: 'success',
        id_token: createIdToken(data),
        access_token: createAccessToken()
      });
  })
  .catch(function (err) {
    console.log(err)
    res.status(202)
      .send({
        status: 'fail',
        error: ['This email already uses', 'Этот мейл уже используется'],
      });
  })

}


function confirmReg(req, res,next) {

  db.none(`UPDATE users SET is_verified =1 WHERE ${req.body.is_email ? 'email' : 'social_id'}=$1` , [req.body.id])
     .then(function (data) {
      res.status(200)
        .send({
            status : 'success'
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}


function updateAccountData(req, res,next) {

  let query =  `UPDATE users SET  email = $2, 
                                  password = $3 
                WHERE id = $1;

                UPDATE users_props SET  avatar = $4, 
                                        first_name = $5, 
                                        last_name = $6, 
                                        address = $7, 
                                        phone = $8, 
                                        d_speciality = $9, 
                                        h_sname = $10, 
                                        h_sname_ru = $11, 
                                        h_website = $12, 
                                        h_stars = $13
                WHERE users_id = $1;

                SELECT  *
                FROM users u
                JOIN users_props p ON p.users_id = u.id
                WHERE u.id = $1;`

  db.one(query, [
    req.body.users_id, 
    req.body.email || '', 
    req.body.password || '', 
    req.body.avatar || '', 
    req.body.first_name || '', 
    req.body.last_name || '',
    req.body.address || '',
    req.body.phone || '',
    req.body.d_speciality || [],
    req.body.h_sname || '',
    req.body.h_sname_ru || '',
    req.body.h_website || '',
    req.body.h_stars || 0,
  ])
   .then(function (data) {
      res.status(200)
        .send({
          data: data,
          id_token: createIdToken(data),
          access_token: createAccessToken()
        });
  })
  .catch(function (err) {
     console.log(err)
     next(err)
  })
}


function getAcccountData(req, res, next) {
  
  let query =  `SELECT * 
                FROM users 
                JOIN users_props p ON p.users_id = u.id
                WHERE id = $1`

  db.one( query, [req.query.id] )
    .then(function (data) {
      res.status(200)
        .send({
          data: data
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}


function getAuthAdmin(req, res, next){
    let query = 'SELECT login FROM secret_admin WHERE login = $1 AND password = $2'

    db.one(query, [req.query.login, req.query.password])
      .then(function (data) {
        res.status(200)
          .send({
            data: Object.assign(data, {
              id_token: createIdToken({ login: req.query.login, account_type: 0 }),
              access_token: createAccessToken()          
            })
          })
      })
      .catch(function (err) {
         console.log(err)
         next(err)
      })

}


function getDialogsList(req, res, next){
    let query =`SELECT  UP.*,
                        U.account_type,
                        C.c_id,
                        ( 
                          SELECT row_to_json(R)
                          FROM conversation_reply R 
                          WHERE R.c_id_fk=$1
                          ORDER BY R.cr_id DESC LIMIT 1 
                        ) last_message,
                        (
                          SELECT COUNT(*) FROM conversation_reply r WHERE r.status = 0 AND c_id_fk = C.c_id AND r.user_id_fk != $1
                        ) count_unread
                FROM users_props UP, users U, conversations C
                WHERE
                CASE
                  WHEN C.user_first = $1
                  THEN C.second_user = UP.users_id
                  WHEN C.second_user = $1
                  THEN C.user_first= UP.users_id
                END
                AND
                (C.user_first =$1 OR C.second_user =$1) 
                AND U.id = UP.users_id
                ORDER BY C.c_id DESC`

    db.any(query, [req.query.users_id])
      .then(function (data) {
        res.status(200)
          .send({
            data: data         
          })
      })
      .catch(function (err) {
         console.log(err)
         next(err)
      })

}


function sendMessage(req, res, next){
    let query =`INSERT INTO conversation_reply (reply, user_id_fk, time, c_id_fk)
                  VALUES ($1, $2, NOW()::timestamp, (SELECT check_exist_dialog_id($2,$3)) )`

    db.any(query, [req.body.reply, req.body.sender_id,req.body.getter_id])
      .then(function (data) {
        res.status(200)
          .send({
            data: data         
          })
      })
      .catch(function (err) {
         console.log(err)
         next(err)
      })

}


function getDialogMessages(req, res, next){

    let query =`UPDATE conversation_reply R SET status = 1 WHERE R.c_id_fk =$1 AND R.user_id_fk != $2;

                SELECT  R.cr_id,
                  R.time,
                  R.reply,
                  R.status,
                  UP.users_id,
                  UP.first_name,
                  UP.last_name,
                  UP.avatar
                FROM users_props UP, conversation_reply R 
                WHERE R.user_id_fk= UP.users_id and R.c_id_fk=$1
                ORDER BY R.cr_id ASC 
                LIMIT 20`

    console.log(query)

    db.any(query, [req.query.dialog_id, req.query.users_id])
      .then(function (data) {
        res.status(200)
          .send({
            data: data         
          })
      })
      .catch(function (err) {
         console.log(err)
         next(err)
      })

}


function createDialog(req, res, next){
    let query =`SELECT check_exist_dialog_id($1,$2)`

    db.any(query, [req.body.sender_id, req.body.getter_id])
      .then(function (data) {
        res.status(200)
          .send({
            data: data         
          })
      })
      .catch(function (err) {
         console.log(err)
         next(err)
      })

}


function deleteDialog(req, res, next){
    let query =`DELETE FROM conversation_reply WHERE c_id_fk =$1;
                DELETE FROM conversations WHERE c_id = $1;`

    db.none(query, [req.body.dialog_id])
      .then(function (data) {
        res.status(200)
          .send({
            data: data         
          })
      })
      .catch(function (err) {
         console.log(err)
         next(err)
      })

}



module.exports = {
  getAuth,
  getAuthAdmin,
  regAccount,
  updateAccountData,
  getAcccountData,
  confirmReg,
  getDialogsList,
  sendMessage,
  getDialogMessages,
  createDialog,
  deleteDialog,
}