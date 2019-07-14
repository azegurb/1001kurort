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
const db = require(`./config`).db



function getClientAddress(request){ 
        return (headers['x-forwarded-for'] || '').split(',')[0] 
            || connection.remoteAddress
}


/////////////////////
// Query Functions
/////////////////////


function getOnline(req, res, next) {
  var socket = require('socket.io').connect('http://localhost:8080')

  socket.on('server-emit', function (data) {
      res.status(200)
      .send({
        status: 'success',
        data : data
      }); 
  });
}



function updateProfilePassword(req, res, next) {
  
  switch( req.body.userType){

    case 1 :
      query = "UPDATE users SET password = $1 WHERE email= $2 RETURNING id,firstname,lastname,email,contactnumber,password,avatar";
      break ;

    case 2 :
      query = "UPDATE doctors SET password = $1 WHERE email= $2 RETURNING id,firstname,lastname,email,contactnumber,password,speciality,adress,avatar";
      break;

    case 3 :
       query = "UPDATE hotels SET password = $1 WHERE email= $2 RETURNING password";
      break;

    default:
      console.log('error! AccountType is not valid');
      break;
  }

  db.one( query, [req.body.password , req.body.email] )
   .then(function (data) {
      data.userType  = req.body.userType
      data.parol = data.password

      console.log(data)
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


function getAllCoordsHotels(req, res, next) {
  
  let query = `SELECT p.users_id id,
                      p.map_location, 
                      p.h_sname, 
                      p.h_sname_ru,
                      p.h_stars,
                      p.avatar,
                      p.h_country_id,
                      p.h_kurort_id
                FROM users u
                JOIN users_props p ON p.users_id = u.id
                WHERE u.account_type = 3`;

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


function getComparesData(req, res, next) {
  
  let countDays = momentRange.range(req.query.start_date, req.query.end_date).diff('days'),
      endDate = moment(req.query.end_date, 'YYYY-MM-DD').add(-1, 'd').format('YYYY-MM-DD'),
      ids,
      childs_age
  
  childs_age = req.query.childs 
    ? Array.isArray(req.query.childs)
      ? req.query.childs.map(id => parseInt(id))
    : [parseInt(req.query.childs)]
  : []

  ids = req.query.ids 
    ? Array.isArray(req.query.ids)
      ? req.query.ids.map(id => parseInt(id))
    : [parseInt(req.query.ids)]
  : []

  let query = `SELECT u.id,
                      up.h_sname,
                      up.h_sname_ru,
                      up.h_stars,
                      up.avatar,
                      row_to_json((array_agg(r))[1]) chipest_room,
                      ( SELECT COUNT(users_id) FROM hotel_comments hc WHERE hc.hotels_id = u.id ) reviews_count,
                      ( SELECT AVG(Cast(overal_rat as Float)) FROM hotel_comments hc WHERE hc.hotels_id = u.id ) general_rating,
                      ( SELECT AVG(Cast(treatm_rat as Float)) FROM hotel_comments hc WHERE hc.hotels_id = u.id ) treatment_rating,
                      ( SELECT COUNT(*) reviews_count FROM hotel_comments WHERE hotels_id = u.id),
                      ( SELECT array_to_json(array_agg( hotels_treatment_names )) 
                        FROM hotels_treatment 
                        JOIN hotels_treatment_names ON hotels_treatment.treatment_name_id = hotels_treatment_names.id
                        WHERE hotels_id = u.id AND hotels_treatment.treatment_name_id = ANY ( up.h_main_treatment_profile_id ) AND value = TRUE and category = 3
                      ) treatments_profiles,
                      ( 
                        SELECT  array_to_json(array_agg(n))
                        FROM hotels_treatment_names n
                        JOIN hotels_treatment t ON t.treatment_name_id = n.id AND value = TRUE 
                        WHERE t.hotels_id = up.users_id AND n.category = 3 AND n.id != ALL( up.h_main_treatment_profile_id )
                      ) secondary_profile, 
                      ( SELECT ARRAY[cname,cname_ru] FROM countries WHERE countries.id = up.h_country_id) country,
                      ( SELECT ARRAY[sname,sname_ru] FROM kurorts WHERE kurorts.id = up.h_kurort_id) kurort
                      FROM users u
                      JOIN users_props up ON up.users_id = u.id
                      JOIN hotels_treatment ht ON ht.hotels_id = u.id
                      LEFT JOIN  (
                          SELECT * 
                          FROM ( 
                           SELECT i.id, 
                                  ic.sname,
                                  ic.max_adults,                                      
                                  i.hotels_id,
                                  ( 
                                    case 
                                      when ceil( $1 / max_adults::float ) >= $10
                                      then ceil( $1 / max_adults::float )
                                      else $10
                                    end
                                  ) count_rooms,
                                  (
                                    select coalesce(SUM(( case is_discount when true then -percent else percent end )), 0)
                                    from hotels_pricing_conditions
                                      where (
                                          case is_by_days_count
                                          -- проверка условия по кл-ву дней или по времени до заезда
                                            when true then
                                        $2 between min_days and max_days
                                            else 
                                        $3 between min_days and max_days
                                          end  
                                      ) and
                                    condition_id = ANY(pcat.conditions_id)                          
                                  ) percent,
                                  SUM( 
                                    case 
                                      when $1 > max_adults
                                      then (
                                        case  
                                          when ($1 / max_adults) > ($10 - 1)
                                          then ($1 / max_adults) * ( price_value[array_length(price_value,1)] + price_value[$1 % max_adults] + get_sum_array($8, pc.surcharge_value) )
                                          else ($10 - 1) * price_value[array_length(price_value,1)] + price_value[$1 % max_adults] + get_sum_array($8, pc.surcharge_value)
                                        end
                                      ) else (
                                      $10 * ( price_value[$1] + get_sum_array($8, pc.surcharge_value) )
                                      )
                                    end
                                  ) default_price,
                                  -- price_value[$1] - число равно кл-ву гостей
                                  public.calc_price_with_discount( 
                                    SUM( 
                                      case 
                                        when $1 > max_adults
                                        then (
                                          case  
                                            when ($1 / max_adults) > ($10 - 1)
                                            then ($1 / max_adults) * ( price_value[array_length(price_value,1)] + price_value[$1 % max_adults] + get_sum_array($8, pc.surcharge_value) )
                                            else ($10 - 1) * price_value[array_length(price_value,1)] + price_value[$1 % max_adults] + get_sum_array($8, pc.surcharge_value)
                                          end
                                        ) else (
                                        $10 * ( price_value[$1] + get_sum_array($8, pc.surcharge_value) )
                                        )
                                      end
                                    )::int, 
                                    pcat.conditions_id, 
                                    $2, 
                                    $3 
                                  ) price_with_discount,
                                  d.currency,
                                  meal_plan,
                                  pcat.treatment_incl,
                                  SUM(pcat.daily_procedures) daily_procedures,
                                  SUM(pcat.daily_doctor_vis) daily_doctor_vis,
                                  SUM(pcat.daily_physioter) daily_physioter,
                                  COUNT(*) days 
                           FROM items i
                           JOIN items_cats ic ON ic.id = i.items_cats_id 
                           LEFT JOIN items_rent_calendar rc ON rc.items_id = i.id
                           JOIN rent_calendar_data d ON d.items_id = i.id AND d.date = rc.date
                           LEFT JOIN hotels_pricing_categories pcat ON pcat.category_id = d.category_id
                           LEFT JOIN hotels_prices_children pc ON pc.category_id = d.category_id 
                           WHERE i.id = ANY(pcat.rooms_id) AND rc.date ${ countDays !== 1 ? 'BETWEEN $5 AND $6' : '= $5' }
                           GROUP BY i.id, d.category_id, d.currency, ic.sname, ic.max_adults, pcat.treatment_incl, daily_procedures, daily_doctor_vis, daily_physioter, meal_plan, pcat.conditions_id
                          ) r
                          ORDER BY price_with_discount, default_price
                      ) r ON r.hotels_id = up.users_id
                    WHERE up.users_id = ANY ($7)
                    GROUP BY u.id, country, kurort, up.h_sname, up.h_sname_ru, up.h_stars, up.avatar, up.h_main_treatment_profile_id, up.users_id
                    LIMIT 3`


  db.any( query, [req.query.adults, countDays, parseInt(req.query.before_arr), null, req.query.start_date, endDate, ids, childs_age, null, req.query.room, null, null, null])
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


function getDiseaseProfilesNames(req, res, next) {
  
  let query = `SELECT * FROM hotels_treatment_names WHERE category=3`
    
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

function getCountriesAndKurortsNames(req, res, next) {
  
  let query1 = `SELECT id, cname country, cname_ru country_ru, image FROM countries`,
      query2 = `SELECT id, country_id, sname kurort, sname_ru kurort_ru FROM kurorts`
    
    db.tx(t => {
        return t.batch([
            t.any(query1),
            t.any(query2)
        ]);
    })
    .then(function (data) {
      res.status(200)
        .send({
          countries: data[0],
          kurorts: data[1],
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}

function addCountryName(req, res, next) {
  
  let query = `INSERT INTO countries (cname, cname_ru, image) VALUES ($1,$2,$3)`
    
    db.none(query, [req.body.cname, req.body.cname_ru, req.body.image])
    .then(function (data) {
      res.status(200)
        .send({
          data: {}
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}

function updateCountryName(req, res, next) {
  
  let query = `UPDATE countries SET cname=$1, cname_ru=$2, image=$3 WHERE id=$4`
    
    db.none(query, [req.body.cname, req.body.cname_ru, req.body.image, req.body.id])
    .then(function (data) {
      res.status(200)
        .send({
          data: {}
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}

function deleteCountryName(req, res, next) {
  
  let query = ` DELETE FROM countries WHERE id=$1;
                DELETE FROM kurorts WHERE country_id=$1`
    
    db.none(query, [req.body.id])
    .then(function (data) {
      res.status(200)
        .send({
          data: {}
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}



function addKurortName(req, res, next) {
  
  let query = `INSERT INTO kurorts (sname, sname_ru, country_id) VALUES ($1,$2,$3)`
    
    db.none(query, [req.body.sname, req.body.sname_ru, req.body.country_id])
    .then(function (data) {
      res.status(200)
        .send({
          data: {}
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}

function updateKurortName(req, res, next) {
  
  let query = `UPDATE kurorts SET sname=$1, sname_ru=$2 WHERE id=$3`
    
    db.none(query, [req.body.sname, req.body.sname_ru, req.body.id])
    .then(function (data) {
      res.status(200)
        .send({
          data: {}
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}

function deleteKurortName(req, res, next) {
  
  let query = `DELETE FROM kurorts WHERE id=$1`
    
    db.none(query, [req.body.id])
    .then(function (data) {
      res.status(200)
        .send({
          data: {}
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}

function getHotelsFacilitiesNames(req, res, next) {
  
  let query = `SELECT * FROM hotels_facilities_names`
    
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

function getHotelsTreatmentsNames(req, res, next) {
  
  let query = `SELECT * FROM hotels_treatment_names`
    
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

function getHotelsFacilitiesProps(req, res, next) {
  
  let query = `SELECT facility_id, is_available, is_free FROM hotels_facilities_props WHERE hotels_id = $1`
    
  db.any(query,[req.query.id])
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

function updateHotelFacilities(req, res, next) {
      
    db.tx(t => {
        const queries = req.body.listData.map(l => {

            let query = `INSERT INTO hotels_facilities_props(facility_id, hotels_id, is_available, is_free, ext_data) 
                              VALUES(${l.id}, ${req.body.id}, ${l.available}, ${l.free}, '${JSON.stringify(l.ext_data)}')
                              ON CONFLICT (hotels_id,facility_id) DO UPDATE 
                              SET is_available = ${l.available}, is_free = ${l.free}, ext_data = '${JSON.stringify(l.ext_data)}'`

            return t.none(query, l)
        });
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


function updateHotelPricesToNextYear(req, res, next) {
  
  let query = `INSERT INTO rent_calendar_data (
                category_id, 
                currency, 
                price_value, 
                items_id, 
                date
               ) SELECT 
                category_id, 
                currency, 
                get_multiply_array_by_percent(price_value, $6), 
                items_id,
                (date + interval'1 year')::date
              FROM rent_calendar_data 
              WHERE category_id IN ($7:csv)
                AND items_id IN ($8:csv) 
                AND ${ req.body.copyByYear 
                ? 'EXTRACT(year FROM "date") = $1'
                : `EXTRACT(year FROM "date") BETWEEN $2 AND $3 
                   AND EXTRACT(month FROM "date") BETWEEN  $4 AND $5 ` }
              ON CONFLICT (date, category_id, items_id) DO UPDATE
              SET price_value = EXCLUDED.price_value`
   
  db.any(query, [req.body.year, req.body.startYear, req.body.endYear, req.body.startMonth, req.body.endMonth, req.body.percent, req.body.category_ids, req.body.rooms_ids])
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


function getLiqpayData(req, res, next){
    var data = new Buffer(JSON.stringify(_.extend({}, req.query, { public_key: 'i85674984859' } ))).toString('base64');
    var signature = str_to_sign('tRYaJgb4R7pMLMnkyCPvZ9lO2BwC3CqGTxwBqp0z' + data + 'tRYaJgb4R7pMLMnkyCPvZ9lO2BwC3CqGTxwBqp0z');

    console.log(data)
    res.status(200)
      .send({
        data: {
          signature, 
          data,
        }
      })
}

function str_to_sign(str){
    var sha1 = crypto.createHash('sha1');
      sha1.update(str);
    return sha1.digest('base64');     
};


function getBanners(req, res, next){
    let query = 'SELECT * FROM banners'

    db.any(query)
      .then(function (data) {
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


function createBanner(req, res, next){
    let query = `INSERT INTO banners (title,description,title_rus,description_rus,image_url,href_to,date_start,date_end)
                  VALUES ($1,$2,$3,$4,$5,$6,$7,$8)` 

    db.any(query, [
        req.body.title, 
        req.body.description, 
        req.body.title_rus, 
        req.body.description_rus, 
        req.body.image_url, 
        req.body.href_to, 
        req.body.date_start, 
        req.body.date_end
      ])
      .then(function (data) {
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

function updateBanner(req, res, next){
    let query = `UPDATE banners 
                  SET title=$1,
                      description=$2,
                      title_rus=$3,
                      description_rus=$4,
                      image_url=$5,
                      href_to=$6,
                      date_start=$7,
                      date_end=$8
                  WHERE id=$9` 

    db.any(query, [
        req.body.title, 
        req.body.description, 
        req.body.title_rus, 
        req.body.description_rus, 
        req.body.image_url, 
        req.body.href_to, 
        req.body.date_start, 
        req.body.date_end,
        req.body.id
      ])
      .then(function (data) {
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

function deleteBanner(req, res, next){
    let query = `DELETE FROM banners WHERE id =$1` 

    db.none(query, [req.body.id])
      .then(function (data) {
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

function getSiteStats(req, res, next){
    let query = `SELECT 
                  ( SELECT COUNT(*) FROM hotel_comments ) total_reviews,
                  ( SELECT COUNT(*) FROM users WHERE account_type = 3 ) total_hotels,
                  ( SELECT COUNT(*) FROM worktop ) total_bookings` 

    db.one(query, [])
      .then(function (data) {
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

function getBlogArticles(req, res, next){
    let query = `SELECT * FROM articles ${req.query.author_id ? 'WHERE author_id = $1' : '' }` 

    db.any(query, [req.query.author_id])
      .then(function (data) {
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

function addBlogArticle(req, res, next){
    let query = ` INSERT INTO articles 
                    (author_id,title,text,image,video,created,is_blog,subject,text_html)
                  VALUES ($1,$2,$3,$4,$5,NOW()::timestamp,$6,$7,$8)
                  ON CONFLICT (id) DO UPDATE
                  SET title=$2,
                      text=$3,
                      image=$4,
                      video=$5,
                      is_blog=$6,
                      subject=$7,
                      text_html=$8` 

    db.none(query, [
        req.body.author_id,
        req.body.title,
        req.body.text,
        req.body.image,
        req.body.video,
        req.body.is_blog,
        req.body.subject,
        req.body.text_html,
      ])
      .then(function (data) {
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


function updateBlogArticle(req, res, next){
    let query =  `UPDATE articles SET title=$2, text=$3, image=$4, video=$5, is_blog=$6, subject=$7, text_html=$9
                  WHERE id = $8` 

    console.log(req)
    db.none(query, [
        req.body.author_id,
        req.body.title,
        req.body.text,
        req.body.image,
        req.body.video,
        req.body.is_blog,
        req.body.subject,
        req.body.article_id,
        req.body.text_html
      ])
      .then(function (data) {
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


function approveBlogArticle(req, res, next){
    let query = ` UPDATE articles SET approved = $1
                    ${
                      req.body.decline_text
                      ? `,decline_udpate_date = NOW()::timestamp,
                         decline_text = $3`
                      : req.body.approved === 1 ? `, decline_udpate_date = NULL, decline_text = NULL, published = NOW()::timestamp` : ``
                    } 
                    WHERE id = $2` 

    db.none(query, [req.body.approved,req.body.article_id, req.body.decline_text])
      .then(function (data) {
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


function getPageBlogData(req,res,next){

  let query1 = `SELECT a.*, up.first_name, up.last_name
                FROM articles a
                JOIN users_props up ON up.users_id = a.author_id
                JOIN users u ON u.id = up.users_id
                WHERE a.approved = 1 AND u.admin_approved = 1
                ORDER BY created DESC`
  
  let query2 = `SELECT a.author_id, up.first_name, up.last_name, up.d_speciality, up.avatar, count(*) 
                FROM articles a
                JOIN users_props up ON up.users_id = a.author_id
                JOIN users u ON u.id = up.users_id
                WHERE a.approved = 1 AND u.admin_approved = 1
                GROUP BY a.author_id, up.id
                ORDER BY count(*) DESC`

  let query3 = `SELECT author_id, p.*
                FROM articles AS r1 JOIN
                     (SELECT CEIL( RANDOM() *
                       (SELECT MAX(id)
                          FROM articles)) AS id)
                      AS r2
                ON r1.author_id >= r2.id
                JOIN users_props p ON p.users_id = r1.author_id
                JOIN users u ON u.id = p.users_id
                WHERE u.admin_approved = 1
                GROUP BY author_id, p.id
                ORDER BY author_id ASC
                LIMIT 16`

  let latest_blog = ` SELECT a.*, up.first_name, up.last_name 
                      FROM articles a
                      JOIN users_props up ON up.users_id = a.author_id
                      JOIN users u ON u.id = up.users_id
                      WHERE is_blog = TRUE AND a.approved = 1 AND u.admin_approved = 1
                      ORDER BY published DESC
                      LIMIT 1`,

      latest_vlog = ` SELECT a.*, up.first_name, up.last_name
                      FROM articles a
                      JOIN users_props up ON up.users_id = a.author_id
                      JOIN users u ON u.id = up.users_id
                      WHERE is_blog = FALSE AND a.approved = 1 AND u.admin_approved = 1
                      ORDER BY published DESC
                      LIMIT 1`,

      popular_blog = `SELECT a.*, up.first_name, up.last_name, COUNT(1) n_comments
                      FROM articles_comments c 
                      JOIN articles a ON a.id = c.article_id
                      JOIN users_props up ON up.users_id = a.author_id
                      JOIN users u ON u.id = up.users_id
                      WHERE a.approved = 1 AND u.admin_approved = 1
                      GROUP BY article_id, a.id, up.first_name, up.last_name
                      ORDER BY n_comments DESC LIMIT 1`
  
  db.tx(t => {
      return t.batch([
          t.any(query1),
          t.any(query2),
          t.any(query3),
          t.any(latest_blog),
          t.any(latest_vlog),
          t.any(popular_blog),
      ]);
  })
  .then(function (data) {
    res.status(200)
      .send({
        all_articles: data[0],
        top_bloggers: data[1],
        random_bloggers: data[2],
        latest_blog: data[3],
        latest_vlog: data[4],
        popular_blog: data[5],
      });
  })
  .catch(function (err) {
    res.status(401)
    next(err)
  })
}

function getBloggerPage(req, res, next){
    let query1 = `SELECT  * FROM articles WHERE author_id = $1 AND approved = 1`,
        query2 = `SELECT  first_name,
                          last_name, 
                          avatar, 
                          ( 
                            SELECT ARRAY[name, name_ru] FROM hotels_treatment_names WHERE id = d_speciality_id
                          ) speciality, 
                          ( SELECT COUNT(1) FROM articles WHERE author_id = $1 ) total_articles 
                  FROM users_props
                  JOIN users u ON u.id = users_props.users_id
                  WHERE users_id = $1 AND u.admin_approved = 1`
      
      db.tx(t => {
          return t.batch([
              t.any(query1, [req.query.author_id]),
              t.one(query2, [req.query.author_id]),
          ]);
      })        
      .then(function (data) {
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


function getBloggerArticle(req, res, next){
    let query = `SELECT a.*, up.first_name, up.last_name
                 FROM articles a
                 JOIN users_props up ON up.users_id = a.author_id
                 WHERE a.id = $1 AND a.author_id = $2 AND a.approved = 1` 

    db.one(query, [req.query.articleId,req.query.bloggerId])
      .then(function (data) {
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



function getBloggerPostComments(req, res, next){
    let query =`SELECT c.*, up.avatar, up.first_name, up.last_name 
                FROM articles_comments c 
                LEFT JOIN users_props up ON up.users_id = c.author_id
                WHERE article_id = $1
                ORDER BY date ASC` 
    
    db.any(query, [req.query.articleId])
      .then(function (data) {
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



function addBloggerPostComment(req, res, next){
    let query = `INSERT INTO articles_comments (article_id,author_id,text,date)
                  VALUES($1,$2,$3,NOW()::timestamp)` 

    db.none(query, [req.body.article_id,req.body.author_id, req.body.text])
      .then(function (data) {
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


function getAdminCuppons(req, res, next){
    
    let reg_percent =  `SELECT percent_discount 
                  FROM coupons_types
                  WHERE id = 0`, 

        coupons =  `SELECT t.* , (max_coupons - ( SELECT COUNT(*) FROM coupons WHERE coupon_type = t.id) ) left_coupons
                        FROM coupons_types t
                        LEFT JOIN coupons c ON t.id = c.coupon_type
                        WHERE max_coupons - ( SELECT COUNT(*) FROM coupons WHERE coupon_type = t.id) > 0 AND t.id != 0
                        GROUP BY t.id`

      db.tx(t => {
          return t.batch([
              t.one(reg_percent),
              t.any(coupons),
          ]);
      })        
      .then(function (data) {
        res.status(200)
          .send({
            data: data
          });
      })
      .catch(function (err) {
        res.status(401)
        .send({
            data: data
        });
      })
}


function updateRegCouponsPrice(req, res, next){
    let query = `UPDATE coupons_types SET percent_discount = $1 WHERE id = 0` 

    db.none(query, [req.body.percent])
      .then(function (data) {
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


function createCustomCuppon(req, res, next){
    let query = `INSERT INTO coupons_types (max_coupons, percent_discount, valid_until, is_unlimited_time) VALUES ($1,$2,$3,$4)` 

    db.none(query, [req.body.max_coupons, req.body.percent, req.body.valid_until, req.body.is_unlimited_time])
      .then(function (data) {
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


function deleteCustomCuppon(req, res, next){
    let query = `DELETE FROM coupons_types WHERE id = $1` 

    db.none(query, [req.body.id])
      .then(function (data) {
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


function getListDoctors(req, res, next){
    let query = `SELECT u.*, up.*
                 FROM users u
                 JOIN users_props up ON up.users_id = u.id
                 WHERE account_type = 2` 

    db.any(query)
      .then(function (data) {
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



function getItemsDetailsNames(req, res, next) {
  
  let query = `SELECT * FROM items_details_names`
    
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


function getRoomDetails(req, res, next) {
  
  let query = ` SELECT i.id, c.sname, c.sname_rus , array_agg(p.*) props
                FROM items i
                JOIN items_cats c ON c.id = i.items_cats_id
                LEFT JOIN items_details_props p ON p.items_id = i.id
                WHERE i.id = $1
                GROUP BY c.id, i.id`
    
  db.any(query,[req.query.items_id])
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

function updateRoomDetails(req, res, next) {
      
    db.tx(t => {
        const queries = req.body.listData.map(l => {

            let query = `INSERT INTO hotels_facilities_props(facility_id, hotels_id, is_available, is_free, ext_data) 
                              VALUES(${l.id}, ${req.body.id}, ${l.available}, ${l.free}, '${JSON.stringify(l.ext_data)}')
                              ON CONFLICT (hotels_id,facility_id) DO UPDATE 
                              SET is_available = ${l.available}, is_free = ${l.free}, ext_data = '${JSON.stringify(l.ext_data)}'`

            return t.none(query, l)
        });
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


function updateConsultantUnswer(req, res, next) {
  
  let query = ` INSERT INTO ask_doctor_answers (question_id, consultant_id, text, date)
                VALUES ($1,$2,$3, NOW()::timestamp )`
    
  db.none(query,[req.body.question_id, req.body.consultant_id, req.body.text, req.body.date])
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


function getListAllUsersWithoutAdmins(req, res, next) {
  
  let query = ` SELECT * 
                FROM users U
                JOIN users_props P ON P.users_id = U.id
                WHERE U.id != 0`
    
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


function getSiteEvents(req, res, next) {
  
  let query = ` SELECT * 
                FROM events
                ORDER BY date
                LIMIT 10`
    
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





/////////////
// Exports
/////////////



module.exports = {

    getOnline : getOnline,
    updateHotelFacilities: updateHotelFacilities,
    updateProfilePassword : updateProfilePassword,
    getAllCoordsHotels: getAllCoordsHotels,
    getComparesData: getComparesData,
    getDiseaseProfilesNames: getDiseaseProfilesNames,
    getCountriesAndKurortsNames: getCountriesAndKurortsNames,
    addCountryName: addCountryName,
    updateCountryName: updateCountryName,
    deleteCountryName: deleteCountryName,
    addKurortName: addKurortName,
    updateKurortName: updateKurortName,
    deleteKurortName: deleteKurortName,
    getHotelsFacilitiesNames:  getHotelsFacilitiesNames,
    getHotelsFacilitiesProps: getHotelsFacilitiesProps,
    getHotelsTreatmentsNames: getHotelsTreatmentsNames,
    updateHotelPricesToNextYear: updateHotelPricesToNextYear,
    getBanners: getBanners,
    createBanner: createBanner,
    updateBanner: updateBanner,
    deleteBanner: deleteBanner,
    getLiqpayData: getLiqpayData,
    getSiteStats: getSiteStats,
    getBlogArticles: getBlogArticles,
    addBlogArticle: addBlogArticle,
    updateBlogArticle: updateBlogArticle,
    approveBlogArticle: approveBlogArticle,
    getPageBlogData: getPageBlogData,
    getBloggerPage: getBloggerPage,
    getBloggerArticle: getBloggerArticle,
    getBloggerPostComments: getBloggerPostComments,
    addBloggerPostComment: addBloggerPostComment,
    getAdminCuppons: getAdminCuppons,
    updateRegCouponsPrice: updateRegCouponsPrice,
    createCustomCuppon: createCustomCuppon,
    deleteCustomCuppon: deleteCustomCuppon,
    getListDoctors: getListDoctors,
    getItemsDetailsNames: getItemsDetailsNames,
    updateConsultantUnswer: updateConsultantUnswer,
    getListAllUsersWithoutAdmins: getListAllUsersWithoutAdmins,
    getSiteEvents: getSiteEvents,
};
