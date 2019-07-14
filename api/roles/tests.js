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

//db
const db = require(`../config`).db



function generateSanatoriums(req, res, next) {

  let countries = [4,13,14,15]
  let kurorts = [28,30,32,33,34,35,36,37,38,39,40,41,42]

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
              ) 
              VALUES( (select users_id from ins1),$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
              RETURNING id;    
              `

  	console.log('TRYING INSERT TESTs SANATORIUMS')

  	db.tx(t => {

        const queries = []

        for( let i = 0 ; i < 4500; i++){
            queries.push(t.one(query, [
		        Math.random(),
		        '',
		        3,
		        'google',
		        (i + 1000) * 567,
		        '',
		        '',
		        '',
		        '',
		        0,
		        countries[Math.round(1 - 0.5 + Math.random() * (4 - 1 + 1))],
		        kurorts[Math.round(1 - 0.5 + Math.random() * (13 - 1 + 1))],
		        'ГЕНЕРАТОР #' + (i + 1000),
		        'ГЕНЕРАТОР #' + (i + 1000),
		        '',
		        Math.round(1 - 0.5 + Math.random() * (5 - 1 + 1)),
		        [],
		        0,
		        Math.random() * Math.random()
  			]))        	
        }

        return t.batch(queries);
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



module.exports = {
	generateSanatoriums,
}

