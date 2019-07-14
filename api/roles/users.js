let promise = require('bluebird');
let _ = require('underscore');
let jwt     = require('jsonwebtoken');
let nodemailer = require('nodemailer');
let moment = require('moment');
let { extendMoment } = require('moment-range');
let momentRange = extendMoment(moment)
var fs = require('fs');
var JSON = require('JSON2');
var crypto = require('crypto');
var sha1 = crypto.createHash('sha1');
var base64 = require('base-64');

//db
const db = require(`../config`).db
const tokenConfig = require(`../config`).tokenConfig
const emailAuthConf = require(`../config`).emailAuthConf

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




function reserveRoom(req, res, next) {

    let query = `INSERT INTO orders (
            users_id,
            status_id,
            created,
            hotels_id,
            date_start,
            date_end,
            nights_count,
            total_rooms,
            adults,
            children,
            guest_contacts,
            guests_names,
            children_ages,
            payed_amount,
            payed_cur,
            share_room,
            transfer_id,
            tur_id,
            discount_percent,
            total_price_for_guest,
            user_price_currency,
            daily_price_default,
            total_price_default
           ) VALUES ($1,$2,NOW()::timestamp,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
           RETURNING id`,
      params = [
            req.body.users_id,
            0,
            null,
            req.body.hotels_id,
            req.body.start_date,
            req.body.end_date,
            req.body.nights,
            req.body.rooms.length,
            req.body.adults,
            req.body.childs,
            req.body.guest_contacts,
            req.body.guest_names,
            req.body.childs_age,
            req.body.payedAmount,
            req.body.payedCurrency,
            req.body.shareRoom,
            req.body.transfer_id,
            req.body.tur_id,
            req.body.discount_percent,
            req.body.total_price_for_guest,
            req.body.currency,
            req.body.daily_price_default,
            req.body.total_price_default,
      ],
      query2 =`INSERT INTO orders_data (
                orders_id,
                items_id,
                category_id,
                s_name,
                treatm_incl,
                meal_plan,
                start_date,
                nights_count
              ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      query3 =`INSERT INTO events (type,ref_id,date) VALUES ($1, $2, NOW()::timestamp );`

    db.tx(t => {
          return t.one( query, params)
            .then( order => {

              t.none(query3, [2, order.id])

              req.body.rooms.map( room =>
                t.none( query2, [order.id, room.items_id, room.category_id, room.sname, room.treatment_incl, room.meal_plan, req.body.start_date, req.body.nights ])
              )
              return '' + order.id              
            })
    })           
  .then(function (data) {
    
    createEmail({
      bookingId: base64.encode(data),
      roomsInfo: req.body.rooms,
      sanatorium:{
        name: req.body.generalInfoHotel.h_sname,
        stars: req.body.generalInfoHotel.h_stars,
        address: req.body.generalInfoHotel.address,
        logo: req.body.generalInfoHotel.avatar,
      },
      contacts: {
        email: req.body.guest_contacts.email,
        first_name: req.body.guest_contacts.name,
        last_name: req.body.guest_contacts.lastname,
        phone: req.body.guest_contacts.phone,
      },
      arrival: req.body.start_date,
      departure: req.body.end_date,
      rooms: req.body.rooms_number * req.body.rooms.length,
      nights: req.body.nights,
      guests: req.body.adults,
      link_cancel_order: `${req.headers.origin}/booking/cancel/${base64.encode(data)}`,
      total_price: req.body.total_price_for_guest,
      currency: req.body.currency,
      payments: req.body.payments,
      share_room: req.body.shareRoom,
      transfer_data: req.body.transfer_data,
      tur_data: req.body.tur_data,
    }, 'create-booking' ) 
        .then((email) => {

          let mailGetter = req.body.guest_contacts.email,
             transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: emailAuthConf,
                secure: true,
              }),
              mailOptions = {
                from: 'sales@1001kurort.com',
                to: mailGetter,
                subject: '1001Kurorts',
                html: email,
              };

          console.log(mailGetter)
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          })
            
        })      

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


function reserveTur(req, res, next) {

    let query = `INSERT INTO orders_tur (
            tur_id,
            start_date,
            end_date,
            adults,
            children,
            babies,
            nights,
            price,
            currency,
            user_id
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           RETURNING tur_id`,
        params = [
          req.body.tur_id,
          req.body.start_date,
          req.body.end_date,
          req.body.adults,
          req.body.children,
          req.body.babies,
          req.body.nights,
          req.body.price,
          req.body.currency,
          req.body.users_id,
        ]

  db
  .one(query, params) 


  db
  .one(query, params)   
  .then( order => db.one(`SELECT * FROM turs WHERE id = $1`, [order.tur_id]) )
  .then(function (data) {

    createEmail({
      turData: data,
      contacts: {
        email: req.body.guest_contacts.email,
        first_name: req.body.guest_contacts.name,
        last_name: req.body.guest_contacts.lastname,
        phone: req.body.guest_contacts.phone,
      },
      adults: req.body.adults,
      children: req.body.children,
      babies: req.body.babies,
      arrival: req.body.start_date,
      departure: req.body.end_date,
      nights: req.body.nights,
      total_price: req.body.price,
      currency: req.body.currency,
    }, 'book-tur' ) 
        .then((email) => {

          let mailGetter = req.body.guest_contacts.email,
             transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: emailAuthConf,
                secure: true,
              }),
              mailOptions = {
                from: 'sales@1001kurort.com',
                to: mailGetter,
                subject: '1001Kurorts',
                html: email,
              };

          console.log(mailGetter)
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          })
            
        })      

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


function funnySatMailVerification(req, res, next) {

    let query = ` UPDATE orders SET status_id = 1 WHERE id = $1;
                  SELECT o.*, 
                         array_to_json(array_agg(d)) rooms,
                         ( SELECT row_to_json((h_sname, h_stars, address, avatar)) FROM users_props p WHERE p.users_id = o.hotels_id ) sanatorium
                  FROM orders o
                  JOIN orders_data d ON d.orders_id = o.id
                  WHERE o.id = $1
                  GROUP BY o.id`

  db.one(query, [req.body.bookingId])  
  .then(function (data) {

    console.log(data)
    createEmail({
      bookingId: base64.encode(req.body.bookingId),
      roomsInfo: data.rooms,
      sanatorium:{
        name: data.sanatorium.f1,
        stars: data.sanatorium.f2,
        address: data.sanatorium.f3,
        logo: data.sanatorium.f4,
      },
      contacts1: {
        email: data.guest_contacts.email,
        first_name: data.guest_contacts.name,
        last_name: data.guest_contacts.lastname,
        phone: data.guest_contacts.phone,
      },
      contacts2: {
        email: data.satellite_data.email,
        first_name: data.satellite_data.first_name,
        last_name: data.satellite_data.last_name,
        phone: data.satellite_data.phone,
      },
      arrival: moment(data.date_start).format('DD.MM.YYYY'),
      departure: moment(data.date_end).format('DD.MM.YYYY'),
      rooms: data.rooms.length,
      roomsInfo: data.rooms,
      nights: data.nights_count,
      guests: data.adults,
      link_cancel_order: `${req.headers.origin}/booking/cancel/${base64.encode(data)}`,
      total_price: data.total_price_for_guest,
      currency: data.user_price_currency,
      payments: data.payments,
      share_room: data.share_room,
      transfer_data: data.transfer_data,
      tur_data: data.tur_data,
    }, 'approve-booking-share' ) 
        .then((email) => {

          let transporter = nodemailer.createTransport({
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
                to: [req.body.firstEmail, req.body.secondEmail],
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


function cancelReserveRoom(req, res, next) {

  let query =  `SELECT status_id FROM orders WHERE id = $1`,
      query2 = `DELETE FROM orders WHERE id = $1;
                DELETE FROM orders_data WHERE orders_id = $1;`

    db.tx(t => {
          return t.one( query, [base64.decode(req.body.enc_order_id)])
            .then( order => {
              t.none( query2, [ order.status_id !== 1 ? base64.decode(req.body.enc_order_id) : -1 ])
            })
    })       
    .then(function (data) {
      console.log(req.body.enc_order_id)
      res.status(200)
        .send({
          status: 'success',
          order_id: base64.decode(req.body.enc_order_id)
        });
    })
    .catch(function (err) {
      console.log(err)
      res.status(202)
        .send({
          status: 'failed',
        });
    })
}


function createAskDoctorQuestion(req, res, next) {
  
  let query = ` INSERT INTO ask_doctor_questions 
                (full_name,email,short_question,question,category, asker_id)
                VALUES($1,$2,$3,$4,$5,$6)`;

  db.none(query, [req.body.full_name, req.body.email, req.body.short_question, req.body.question, req.body.category, req.body.asker_id])
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


function getAskDoctorQuestions(req, res, next) {
  
  let query = ` SELECT q.*, 
                       ARRAY[COALESCE(n.name, 'Other'), COALESCE(n.name_ru, 'Другое')] category_name,
                       array_to_json(array_agg(a)) issue
                FROM ask_doctor_questions q
                LEFT JOIN hotels_treatment_names n ON n.id = q.category
                LEFT JOIN ask_doctor_answers a ON question_id = q.id
                WHERE status = 1
                GROUP BY q.id, n.name, n.name_ru`;

  db.any(query)
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


function getDoctorsAskDoctorQuestions(req, res, next) {
  
  let query =  `SELECT  q.*,
                       ARRAY[COALESCE(n.name, 'Other'), COALESCE(n.name_ru, 'Другое')] category_name,
                       array_to_json(array_agg(a)) issue
                FROM ask_doctor_questions q
                LEFT JOIN hotels_treatment_names n ON n.id = q.category
                LEFT JOIN ask_doctor_answers a ON question_id = q.id
                WHERE status != 1 AND (SELECT id FROM ask_doctor_answers ans WHERE ans.question_id = q.id AND ans.consultant_id = $1) IS NULL
                GROUP BY q.id, n.name, n.name_ru`;

  let params = [req.query.doctor_id];
  console.log(params)

  db.any(query, params)
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


function getUsersAskDoctorQuestions(req, res, next) {
  
  let query = `SELECT q.*, 
                      ARRAY[COALESCE(n.name, 'Other'), COALESCE(n.name_ru, 'Другое')] category_name,
                      array_to_json(array_agg(a)) answers
                FROM ask_doctor_questions q
                LEFT JOIN hotels_treatment_names n ON n.id = q.category
                LEFT JOIN ask_doctor_answers a ON a.id = ANY(q.answer_id)
                WHERE asker_id = $1
                GROUP BY q.id, n.name, n.name_ru`;

  db.any(query, [req.query.users_id])
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


function updatePreferredSatellite(req, res, next) {
  
  let query = `UPDATE users_props SET preferred_satellite = $2 WHERE users_id = $1;
               
               SELECT * FROM users u
               JOIN users_props up ON up.users_id = u.id
               WHERE users_id = $1 `;

  db.one(query, [ req.body.users_id, req.body.satelliteData ])
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


function getActiveRequestToShareRoom(req, res, next) {
  
  let query1 = `SELECT r.*, p.phone, p.first_name, p.last_name, u.email, p.users_id
                FROM funny_satellite_requests r
                JOIN users u ON u.id = r.joiner_id
                JOIN users_props p ON p.users_id = r.joiner_id
                WHERE host_users_id = $1 ORDER BY r.id`,
      query2 = `SELECT r.id request_id, r.*, o.*, array_to_json(array_agg(d.*)) rooms
                FROM funny_satellite_requests r 
                JOIN orders o ON o.id = r.booking_id
                LEFT JOIN orders_data d ON d.orders_id = o.id  
                WHERE r.joiner_id = $1 AND status = 0
                GROUP BY r.id, o.id
                ORDER BY r.id`;

    db.tx(t => {
      return t.batch([
        t.any(query1,[req.query.users_id]),
        t.any(query2,[req.query.users_id])
      ]);
    })
    .then( data => {
      res.status(200)
        .send({
          incoming: data[0],
          outgoing: data[1],
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}


function addRequestToShareRoom(req, res, next) {
  
  let query = `INSERT INTO funny_satellite_requests ( booking_id, host_users_id, joiner_id)
                VALUES ($1,$2,$3)`;

    db.none(query, [req.body.booking_id, req.body.host_users_id, req.body.joiner_id] )
    .then( data => {
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


function cancelRequestToShareRoom(req, res, next) {
  
  let query = `DELETE FROM funny_satellite_requests WHERE id = $2 `;

    db.none(query, [req.body.status, req.body.request_id] )
    .then( data => {
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


function checkCouponIsAvailable(req, res, next) {
  
  let query1 = `SELECT c.id, c.code, percent_discount
                FROM coupons c
                JOIN coupons_types t ON t.id = c.coupon_type 
                WHERE code = $1 
                AND ( c.valid_until <= now() OR c.valid_until IS NULL )`,
      query2 = `SELECT t.*, users_id doctor, d_coupon_code 
                FROM users_props p
                JOIN doctor_coupons_types t ON t.id = p.d_coupon_type
                WHERE d_coupon_code = $1`

    db.tx(t => {
      return t.batch([
        t.any(query1,[req.query.coupon_code]),
        t.any(query2,[req.query.coupon_code])
      ]);
    })    
    .then( data => {
      res.status(200)
        .send({
          other_coupon: data[0],
          doctor_coupon: data[1]
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}


function declineRequestToShareRoomByHost(req, res, next) {
  
  let query = `UPDATE funny_satellite_requests SET status = 2 WHERE id = $1 `;

    db.none(query, [req.body.request_id] )
    .then( data => {
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


function approveRequestToShareRoomByHost(req, res, next) {
  
  let query = `UPDATE funny_satellite_requests SET status = 1 WHERE id = $1;
               UPDATE orders SET satellite_data = $2, satellite_id = $3 WHERE id = $4`;

    db.none(query, [req.body.request_id, req.body.satellite_data, req.body.satellite_id, req.body.booking_id] )
    .then( data => {
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


function getOwnBookings(req, res, next) {
  
  let query =  `SELECT o.*, 
                       array_to_json(array_agg(d)) as booked_rooms , 
                       up.h_sname 
                FROM orders o
                JOIN orders_data d ON d.orders_id = o.id
                JOIN users_props up ON up.users_id = o.hotels_id
                WHERE o.users_id = $1
                GROUP BY o.id, up.h_sname`;

    db.any(query, [req.query.users_id] )
    .then( data => {
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



/////////////
// Exports
/////////////



module.exports = {
	reserveRoom,
  reserveTur,
  cancelReserveRoom,
  getAskDoctorQuestions,
  createAskDoctorQuestion,
  getUsersAskDoctorQuestions,
  updatePreferredSatellite,
  getActiveRequestToShareRoom,
  addRequestToShareRoom,
  cancelRequestToShareRoom,
  getDoctorsAskDoctorQuestions,
  checkCouponIsAvailable,
  declineRequestToShareRoomByHost,
  approveRequestToShareRoomByHost,
  funnySatMailVerification,
  getOwnBookings,
}