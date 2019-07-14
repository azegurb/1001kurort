let promise = require('bluebird');
let _ = require('lodash');
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
const emailAuthConf = require(`../config`).emailAuthConf





function getListHotels(req, res, next) {
  
  let query =  `SELECT u.*, up.*
                FROM users u
                JOIN users_props up ON up.users_id = u.id
                WHERE account_type = 3`
    
  db.any(query,[])
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


function getHotelsNames(req, res, next) {
  
  let query =  `SELECT u.id, p.h_sname, p.h_sname_ru 
                FROM users u
                JOIN users_props p ON p.users_id = u.id
                WHERE account_type = 3`
    
  db.any(query,[])
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


function getGeneralInfo(req, res, next) {

  db.one('SELECT * FROM users_props WHERE users_id = $1' , req.query.users_id )
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

function updateGeneralInfo(req, res, next) {

  db.none(` UPDATE users_props SET  h_sname = $1, 
                                    h_country_id = $2, 
                                    h_kurort_id = $3, 
                                    h_stars = $4 , 
                                    h_website = $5,
                                    h_about = $7,
                                    h_about_ru = $8,
                                    address = $9,
                                    map_location = $10
            WHERE users_id = $6` , 
    [
      req.body.sname,
      req.body.countryId,
      req.body.kurortId,
      req.body.stars,
      req.body.website,
      req.body.users_id,
      req.body.about,
      req.body.about_ru,
      req.body.address,
      req.body.location_json,
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



function getPayments(req, res, next) {

  db.one(`SELECT  h_payments_visa, 
                  h_payments_master, 
                  h_payments_maestro, 
                  h_payments_checkin 
          FROM users_props 
          WHERE users_id = $1` , req.query.users_id )
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

function updatePayments(req, res, next) {

  db.none(`UPDATE users_props SET  
                              h_payments_visa = $1, 
                              h_payments_master = $2, 
                              h_payments_maestro = $3, 
                              h_payments_checkin = $4
              WHERE users_id = $5` , 
    [
      req.body.payments_visa,
      req.body.payments_master,
      req.body.payments_maestro,
      req.body.payments_checkin,
      req.body.users_id
    ] )
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




function getPriceConditions(req, res, next) {

  db.any('SELECT * FROM hotels_pricing_conditions WHERE hotels_id = $1' , req.query.users_id )
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


function addPriceConditions(req, res, next) {
  
  let query = `INSERT INTO hotels_pricing_conditions 
                                        (  
                                          hotels_id,
                                          name,
                                          min_days,
                                          max_days,
                                          is_discount,
                                          percent,
                                          is_by_days_count
                                        ) VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING condition_id`

  db.one(query,
                [    
                  req.body.users_id,  
                  req.body.name,
                  req.body.min_days,
                  req.body.max_days,
                  req.body.is_discount,
                  req.body.percent,
                  req.body.is_by_days_count
                ]
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


function updatePriceConditions(req, res, next) {
  
  let query = `UPDATE hotels_pricing_conditions SET
                                                    name = $1,
                                                    min_days = $2,
                                                    max_days = $3,
                                                    is_discount = $4,
                                                    percent = $5,
                                                    is_by_days_count= $6

                                                    WHERE hotels_id= $7 and condition_id=$8`

  db.any(query,
                [    
                  req.body.name,
                  req.body.min_days,
                  req.body.max_days,
                  req.body.is_discount,
                  req.body.percent,
                  req.body.is_by_days_count,
                  req.body.users_id,
                  req.body.condition_id
                ]
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


function deletePriceConditions(req, res, next) {
  db.none('DELETE FROM hotels_pricing_conditions WHERE hotels_id=$1 and condition_id=$2', [req.body.users_id, req.body.condition_id])
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


function getRooms(req, res, next) {

  db.any(`  SELECT items.id room_id, assets_ids, rooms_in_hotel, items_cats.* FROM items 
              LEFT JOIN items_cats ON items.items_cats_id = items_cats.id  
              WHERE items.hotels_id =$1 ` , [req.query.users_id] )
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

function addRoom(req, res, next) {
  
    db.tx(t => {
        return t.one( `INSERT INTO items_cats (sname, sname_rus, total_rooms, total_area, max_adults, number_beds, hotels_id) 
                          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`, [ req.body.sname, req.body.sname_rus, req.body.total_rooms, req.body.total_area, req.body.max_adults, req.body.number_beds, req.body.users_id ])
                .then( item => t.any(`INSERT INTO items ( items_cats_id, rooms_in_hotel, hotels_id ) VALUES ($1, $2, $3)`, [item.id, req.body.count_same_rooms, req.body.users_id]) )
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

function addPhotoToRoom(req, res, next) {

  db.none('UPDATE items SET assets_ids = $1 WHERE id = $2' , 
    [      
      req.body.assets_ids,
      req.body.items_id
    ]
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


function updateRoom(req, res, next) {
  
    db.none(`UPDATE items
                SET rooms_in_hotel = $1 
                WHERE hotels_id = $8 AND items_cats_id = $9;
             
             UPDATE items_cats
                SET sname = $2, 
                    sname_rus = $3, 
                    total_rooms = $4, 
                    total_area = $5, 
                    max_adults = $6, 
                    number_beds = $7
                WHERE hotels_id = $8 AND id = $9`, 
      [      
        req.body.count_same_rooms,
        req.body.sname,
        req.body.sname_rus,
        req.body.total_rooms,
        req.body.total_area,
        req.body.max_adults,
        req.body.number_beds,
        req.body.users_id,
        req.body.changingRoomId,
      ]
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


function deleteRoom(req, res, next) {

  db.any(`DELETE FROM items 
            WHERE hotels_id = $1 AND id = $3;
          DELETE FROM items_cats 
            WHERE hotels_id = $1 AND id = $2;
          UPDATE hotels_pricing_categories SET rooms_id = array_remove(rooms_id, $3);`, 
    [ req.body.users_id , req.body.deletingItemCatsRoomId, req.body.deletetingRoomId ] )
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


function getPriceCategories(req, res, next) {
  db.any('SELECT * FROM hotels_pricing_categories WHERE hotels_id= $1' , [req.query.users_id] )
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


function addPriceCategory(req, res, next) {
  
  let query = `INSERT INTO hotels_pricing_categories
                                        (  
                                          hotels_id,
                                          name,
                                          meal_plan,
                                          treatment_incl,
                                          rooms_id,
                                          conditions_id,
                                          is_nonrefundable,
                                          daily_procedures,
                                          daily_doctor_vis,
                                          daily_physioter
                                        ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING category_id`

  db.one(query,
                [    
                  req.body.users_id,  
                  req.body.name,
                  req.body.meal_plan,
                  req.body.treatment_incl,
                  req.body.rooms_id,
                  req.body.conditions_id,
                  req.body.is_nonrefundable,
                  req.body.daily_procedures,
                  req.body.daily_doctor_vis,
                  req.body.daily_physioter
                ]
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


function updatePriceCategory(req, res, next) {
  
  let query = `UPDATE hotels_pricing_categories SET name =$1,
                                                    meal_plan =$2,
                                                    treatment_incl= $3,
                                                    rooms_id =$4,
                                                    is_nonrefundable =$5,
                                                    conditions_id = $6,
                                                    daily_procedures = $7,
                                                    daily_doctor_vis = $8,
                                                    daily_physioter = $9

                WHERE hotels_id =$10 AND category_id =$11`

  db.none(query,
                [    
                  req.body.name,  
                  req.body.meal_plan,
                  req.body.treatment_incl,
                  req.body.rooms_id,
                  req.body.is_nonrefundable,
                  req.body.conditions_id,
                  req.body.daily_procedures,
                  req.body.daily_doctor_vis,
                  req.body.daily_physioter,
                  req.body.users_id,
                  req.body.category_id,

                ]
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


function deletePriceCategory(req, res, next) {
  db.none('DELETE FROM hotels_pricing_categories WHERE category_id=$1', [req.body.id])
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



function getPriceChildren(req, res, next) {
  db.any('SELECT * FROM hotels_prices_children WHERE hotels_id= $1' , [req.query.users_id] )
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


function addPriceChildren(req, res, next) {
  db.none( `INSERT INTO hotels_prices_children(category_id,surcharge_value,currency, hotels_id) 
        VALUES ($1,$2,$3,$4) 
            ON CONFLICT (category_id) DO UPDATE
            SET surcharge_value=$2, currency=$3` , [req.body.category_id, req.body.surcharge_value, req.body.currency, req.body.users_id] )
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


function updatePriceChildren(req, res, next) {
  db.none(`UPDATE hotels_prices_children SET surcharge_value =$1, currency =$2
                  WHERE category_id =$3` , [req.body.surcharge_value, req.body.currency, req.body.category_id] )
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


function deletePriceChildren(req, res, next) {
  db.none('DELETE FROM hotels_prices_children WHERE category_id=$1', [req.body.category_id])
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


function getPhotos(req, res, next) {

  db.any('SELECT * FROM hotels_assets WHERE hotels_id = $1 AND cat_id = 0' , req.query.users_id )
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


function addPhoto(req, res, next) {

  db.none("INSERT INTO hotels_assets ( hotels_id, cat_id, url, ext_data )"+
                          "values ( $1, $2, $3, $4 ) ",
                           
                            [
                              req.body.users_id,
                              0,
                              req.body.url,
                              req.body.extData
                            ]
  )
  .then(function (data) {
      res.status(200)
        .send({
          status: 'success',
          data : data
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}


function updatePhoto(req, res,next) {

  db.none("UPDATE hotels_assets SET url= $1 , ext_data = $2 WHERE hotels_id = $3 AND url = $4 AND cat_id = 0" , 
         [
            req.body.newImage,
            req.body.extData,
            req.body.users_id,
            req.body.existImage,
          ]
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


function deletePhoto(req, res, next) {

  db.any('DELETE FROM hotels_assets WHERE hotels_id = $1 AND url = $2 AND cat_id = 0' , [ req.body.users_id, req.body.url ] )
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


function getCalendar(req, res, next) {

  let query1 = `SELECT * FROM get_calendar($1, $2) c ORDER BY c.g`,

      query2 = `SELECT i.id,
                       ic.sname,
                       ic.max_adults,
                       ( 
                        SELECT array_to_json(array_agg(coalesce(c.max_rent,0)))
                        FROM (
                          SELECT  c.g,
                                  rc.max_rooms_rent max_rent,
                                  items_id
                          FROM get_calendar($1, $2) c
                          LEFT JOIN items_rent_calendar rc ON rc.date = c.g AND rc.items_id = i.id
                          ORDER BY c.g
                        ) c
                       ) max_rent,
                       ( 
                        SELECT array_to_json(array_agg(coalesce(c.booked,0)))
                        FROM (
                          SELECT COUNT(w) booked
                          FROM get_calendar($1, $2) c
                          LEFT JOIN worktop w ON w.ddate = c.g AND w.items_id = i.id
                          GROUP BY c.g
                          ORDER BY c.g
                        ) c
                       ) booked,
                       ( 
                        SELECT array_to_json(array_agg(coalesce(c.left_room,0)))
                        FROM (
                          SELECT rc.max_rooms_rent - COUNT(w) left_room
                          FROM get_calendar($1, $2) c
                          LEFT JOIN worktop w ON w.ddate = c.g AND w.items_id = i.id
                          LEFT JOIN items_rent_calendar rc ON rc.date = c.g AND rc.items_id = i.id
                          GROUP BY c.g, rc.max_rooms_rent
                          ORDER BY c.g
                        ) c
                       ) left_room,
                       (
                        SELECT array_to_json(array_agg(c))
                        FROM (
                         SELECT c.category_id,
                                ( 
                                  SELECT array_to_json(array_agg(d)) 
                                  FROM get_calendar($1, $2 ) days
                                  LEFT JOIN rent_calendar_data d ON d.category_id = c.category_id AND d.date = days.g AND d.items_id = i.id
                                ) days
                         FROM hotels_pricing_categories c
                         WHERE i.id = ANY(c.rooms_id)
                         GROUP BY c.category_id
                        ) c
                       ) categories
              FROM  items i
              JOIN  items_cats ic ON ic.id = i.items_cats_id
              WHERE i.hotels_id = $3
              GROUP BY i.id, ic.sname,ic.max_adults`

    db.tx(t => {
        return t.batch([
            t.any(query1, [req.query.date_start, req.query.date_end]),
            t.any(query2, [req.query.date_start, req.query.date_end, req.query.users_id]),
        ]);
    })
    .then(function (data) {
      res.status(200)
        .send({
          days: data[0],
          calendar: data[1],
        });
    })   
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}


function updateCalendarMaxRent(req, res, next) {
  
    db.tx(t => {
        if(req.body.max_rooms_rent){
          const queries = req.body.dates.map(date => {
            return t.none(`INSERT INTO items_rent_calendar 
                            ( items_id, date,  max_rooms_rent, hotels_id) 
                              VALUES( $1,$2,$3,$4) 
                                  ON CONFLICT (items_id, date ) DO UPDATE SET max_rooms_rent = $3`,
          [
            req.body.items_id, 
            moment(date).format('YYYY-MM-DD'), 
            req.body.max_rooms_rent, 
            req.body.users_id
          ])
        });
        return t.batch(queries);
      }else {
        let dates = []
        req.body.dates.map( date => dates.push( moment(date).format('YYYY-MM-DD') ) )
        return t.none(`DELETE FROM items_rent_calendar WHERE items_id=$1 AND date IN ($2:csv)`, [req.body.items_id, dates])
      }
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


function updateCalendarPrice(req, res, next) {
    db.tx(t => {
        const queries = req.body.dates.map(date => {
            return t.none(`INSERT INTO rent_calendar_data( 
                              category_id, 
                              price_value, 
                              currency,
                              date,
                              items_id
                              ) VALUES( $1,$2,$3,$4,$5) 
                                  ON CONFLICT ( date, category_id, items_id) DO UPDATE
                                    SET price_value = $2,
                                        currency = $3`,
          [
            req.body.category_id, 
            req.body.price_value, 
            req.body.currency, 
            moment(date).format('YYYY-MM-DD'), 
            req.body.items_id
          ])
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


function getSanatoriumsInSearch(req, res, next) {

    /////////////////////////////////////////////////////////////
    // PREPARING QUERY DATA
    /////////////////////////////////////////////////////////////


    let searchAsTreatment = req.query.by_treatm == 'true' ? true: false,
        rooms_length = JSON.parse(req.query.rooms).length,
        hotels_ids = [],
        items_ids = [],
        isArrayTreatmentId = Array.isArray(req.query.t_id),
        countDays = momentRange.range(req.query.start_date, req.query.end_date).diff('days'),
        endDate = moment(req.query.end_date, 'YYYY-MM-DD').add(-1, 'd').format('YYYY-MM-DD'),
        diseasesProfiles = req.query.diseasesProfiles ? [] : null,
        treatmentBase = req.query.treatmentBase ? [] : null,
        facilities = req.query.facilities ? [] : null,
        roomDetails = req.query.roomDetails ? [] : null,
        childs_age = []
      
    if(req.query.childs){
      parseInt(req.query.childs) > 1
      ? req.query.childs_age.map( item => childs_age.push(parseInt(item)) )
      :   childs_age.push(parseInt(req.query.childs))
    }

    if(req.query.diseasesProfiles) {
      Array.isArray(req.query.diseasesProfiles)
      ? req.query.diseasesProfiles.map( item => diseasesProfiles.push(parseInt(item)) )
      : diseasesProfiles.push(parseInt(req.query.diseasesProfiles))
    }

    if(req.query.treatmentBase) {
      Array.isArray(req.query.treatmentBase)
      ? req.query.treatmentBase.map( item => treatmentBase.push(parseInt(item)) )
      : treatmentBase.push(parseInt(req.query.treatmentBase))
    }

    if(req.query.facilities) {
      Array.isArray(req.query.facilities)
      ? req.query.facilities.map( item => facilities.push(parseInt(item)) )
      : facilities.push(parseInt(req.query.facilities))
    }

    if(req.query.roomDetails) {
      Array.isArray(req.query.roomDetails)
      ? req.query.roomDetails.map( item => roomDetails.push(parseInt(item)) )
      : roomDetails.push(parseInt(req.query.roomDetails))
    }

    ///////////////////////////////////////////////

    
      let filterByName = `(( 
        up.h_kurort_id IN ( SELECT id FROM kurorts WHERE lower(sname) = lower($8) OR lower(sname_ru)= lower($8) ) 
      ) OR ( lower(up.h_sname) = lower($8) OR lower(up.h_sname_ru) = lower($8) ))`

      let filterByTreatmentId = `( 
        -- дополнительные проверки на совпадение профиля лечения и выбранного курорта
        up.h_kurort_id = $7
        AND t.treatment_name_id::text = ${ isArrayTreatmentId ? `ANY($6)` : `$6` } AND t.value = TRUE
      )`

      let filterDiseasesProfiles = `${ diseasesProfiles 
        ? `(array_length((SELECT ARRAY ( SELECT UNNEST(up.h_main_treatment_profile_id) INTERSECT SELECT UNNEST($9)) FROM (SELECT up.h_main_treatment_profile_id as a1, $9 as a2) q ),1) != 0)` 
        : `TRUE` }`

      let filterTreatmentBase = `${ treatmentBase 
        ? `(SELECT row_number() OVER () FROM hotels_treatment WHERE hotels_id=u.id AND value=TRUE AND treatment_name_id=ANY($10) GROUP BY hotels_id) IS NOT NULL` 
        : `TRUE` }`
                  
      let filterFacilities = `${ facilities 
        ? `(SELECT row_number() OVER () FROM hotels_facilities_props WHERE hotels_id=u.id AND is_available=TRUE AND facility_id=ANY($11) GROUP BY hotels_id) IS NOT NULL` 
        : `TRUE` }`      

      let filterStars = `( h_stars ${ req.query.stars 
        ? Array.isArray(req.query.stars) ? `IN( ${ req.query.stars.map( item => parseInt(item) )} )` : `=${parseInt(req.query.stars)}` 
        : `IS NOT NULL` })`

      ////////////////////////

      let filterByNameOrTreatmentId = searchAsTreatment ? filterByTreatmentId : filterByName

    //---------------------------------------------
    // QUERY: Filtering hotels by some conditionals 
      
      let qFilterHotels = `SELECT u.id,
                                  array_agg(r.rooms) rooms,
                                  up.h_sname,
                                  up.h_sname_ru,
                                  up.h_stars,
                                  up.avatar,
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
                          FROM get_hotel_rooms(
                            $1::date, 
                            $2::date, 
                            $3::int,
                            $4::int, 
                            $5::json,
                            $13::double precision[],
                            $14::double precision[],
                            $15::int[]
                          ) 
                          AS r(id INT, rooms json)
                          JOIN users u ON u.id = r.id
                          JOIN users_props up ON up.users_id = r.id
                          ${searchAsTreatment ? 'LEFT JOIN hotels_treatment t ON t.hotels_id = r.id' : ''}
                          WHERE u.account_type = 3 
                          AND ${filterByNameOrTreatmentId} 
                          AND ${filterDiseasesProfiles}
                          AND ${filterTreatmentBase}
                          AND ${filterFacilities}
                          AND ${filterStars}
                          group by r.id, u.id, up.h_country_id, up.h_kurort_id, up.h_sname, up.h_sname_ru, up.h_stars, up.avatar, up.h_main_treatment_profile_id, up.users_id
                          having count(*) = $12; `;

  let qFilterHotelsParams = [
    req.query.start_date,
    endDate,
    parseInt(req.query.before_arr),
    parseInt(countDays),
    req.query.rooms,
    req.query.t_id || null,
    req.query.k_id || null,
    req.query.kur_or_san || null,
    diseasesProfiles, 
    treatmentBase, 
    facilities,
    rooms_length,
    req.query.priceFrom || [0,0,0,0,0],
    req.query.priceTo || [5000,5000,5000,5000,5000],
    roomDetails,
  ]
 
  /////////////////////////////////////////////////////////
  // GETTING ROOMS

                                      
  // getting available hotels and rooms
  db.any(qFilterHotels, qFilterHotelsParams)
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


function getTreatments(req, res, next) {
  
  let query = `SELECT treatment_name_id, value FROM hotels_treatment WHERE hotels_id = $1`
    
  db.any(query,[req.query.users_id])
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


function updateTreatments(req, res, next) {
      
    db.tx(t => {
        const queries = req.body.listData.map(l => {
            return t.none(`INSERT INTO hotels_treatment( treatment_name_id, value, hotels_id)
                              VALUES( ${l.id}, ${l.checked}, ${req.body.users_id} )
                              ON CONFLICT (hotels_id,treatment_name_id) DO UPDATE 
                              SET treatment_name_id = ${l.id}, value = ${l.checked}`, l)
        });
        if( req.body.mainDiseaseProfiles){
          t.none(`UPDATE users_props SET h_main_treatment_profile_id = $1 WHERE users_id=$2`, [req.body.mainDiseaseProfiles, req.body.users_id])
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




function getSanatoriumPageData(req, res, next) {

  let countDays = momentRange.range(req.query.start_date, req.query.end_date).diff('days'),
      endDate = moment(req.query.end_date, 'YYYY-MM-DD').add(-1, 'd').format('YYYY-MM-DD'),
      childs_age = [],
      roomDetails = req.query.roomDetails ? [] : null

  if(req.query.childs){
      parseInt(req.query.childs) > 1
      ? req.query.childs_age.map( item => childs_age.push(parseInt(item)) )
      :   childs_age.push(parseInt(req.query.childs))
  }
  
  if(req.query.roomDetails) {
    Array.isArray(req.query.roomDetails)
    ? req.query.roomDetails.map( item => roomDetails.push(parseInt(item)) )
    : roomDetails.push(parseInt(req.query.roomDetails))
  }

  let query0 = `SELECT u.id 
                FROM users_props p 
                JOIN users u ON u.id = p.users_id
                WHERE u.id = $1 AND u.admin_approved = 1`,

      query1 = `SELECT  up.users_id,
                        up.h_sname,
                        up.h_sname_ru,
                        up.h_stars,
                        up.h_about,
                        up.h_about_ru,
                        ( SELECT AVG(Cast(overal_rat as Float)) FROM hotel_comments hc WHERE hc.hotels_id = up.users_id ) general_rating,
                        ( SELECT AVG(Cast(treatm_rat as Float)) FROM hotel_comments hc WHERE hc.hotels_id = up.users_id ) treatment_rating,
                        up.map_location,
                        up.address
                FROM users_props up
                WHERE up.users_id = $1`,

      query2 = `SELECT  tn.name,
                        tn.name_ru
                FROM users_props up
                JOIN hotels_treatment_names tn 
                  ON tn.id = ANY ( ARRAY( SELECT h_main_treatment_profile_id || 0 FROM users_props WHERE users_id= $1 ) )
                  AND tn.category = 3
                WHERE up.users_id = $1`,     

      query3 = `SELECT  tn.name,
                  tn.name_ru
                FROM users_props up
                JOIN hotels_treatment t ON t.hotels_id = up.users_id
                JOIN hotels_treatment_names tn ON t.treatment_name_id = tn.id AND value = TRUE AND NOT tn.id = ANY (ARRAY( SELECT h_main_treatment_profile_id || 0 FROM users_props WHERE users_id=$1 ))
                WHERE up.users_id = $1 AND tn.category = 3`,      
      
      query4 = `SELECT tn.*
                FROM hotels_treatment ht
                JOIN hotels_treatment_names tn ON ht.treatment_name_id = tn.id
                WHERE ht.hotels_id = $1 and ht.value=TRUE
                ORDER BY category`,

      query5 = `SELECT h_pluses, 
                       h_minuses, 
                       h_about,
                       h_videos
                  FROM users_props 
                  WHERE users_id=$1`,
      
      query6 = `
        SELECT r.rooms
        FROM get_hotel_rooms(
          $1::date, 
          $2::date, 
          $3::int,
          $4::int, 
          $5::json,
          $7::double precision[],
          $8::double precision[],
          $9::int[]
        ) 
        AS r(id INT, rooms json)
        JOIN users u ON u.id = r.id
        JOIN users_props up ON up.users_id = r.id
        WHERE u.account_type = 3 and r.id = $6`,

      query7 = `SELECT * FROM hotels_assets WHERE hotels_id = $1`,
      
      query8 = `SELECT  i.id, array_agg(a.url) photos, c.* 
                        FROM items i
                        LEFT JOIN hotels_assets a ON a.id = ANY(i.assets_ids)
                        JOIN items_cats c ON c.id = i.items_cats_id
                        WHERE i.hotels_id = $1
                        GROUP BY i.id, c.id `,      

      query9 = `SELECT fname, fname_ru, is_available, is_free , ext_data
                FROM hotels_facilities_props fp
                JOIN hotels_facilities_names fn ON  fn.id = fp.facility_id
                WHERE hotels_id = $1 AND fp.is_available = true`    

    db.tx(t => {
        return t.one( query0, [req.query.id])
                .then( user => { 

                  return t.batch([
                    t.any(query1,[user.id]),
                    t.any(query2,[user.id]),
                    t.any(query3,[user.id]),
                    t.any(query4,[user.id]),
                    t.one(query5,[user.id]),
                    t.any(query6, [
                      req.query.start_date,
                      endDate,
                      parseInt(req.query.before_arr),
                      parseInt(countDays),
                      req.query.rooms,
                      user.id,
                      req.query.priceFrom || [0,0,0,0,0],
                      req.query.priceTo || [5000,5000,5000,5000,5000],
                      roomDetails,
                    ]),
                    t.any(query7, [user.id]),
                    t.any(query8, [user.id]),
                    t.any(query9, [user.id]),
                  ]);

                })
    })
    .then( data => {
      res.status(200)
        .send({
          general: data[0],
          main_profile: data[1],
          secondary_profile: data[2],
          treatment_base: data[3],
          pluses_minuses_about: data[4],
          rooms: data[5],
          photoVideos: data[6],
          rooms_details: data[7],
          facilities: data[8],
        });
    })
    .catch(function (err) {
      console.log(err)
       res.status(202)
          .send({
            error: true
          });
    })
}



function getSanatoriumBookingData(req, res, next) {
  
  let query = ` SELECT  h_sname, 
                        h_sname_ru,
                        h_stars,
                        address,
                        avatar,
                        h_payments_visa,
                        h_payments_master,
                        h_payments_maestro,
                        h_payments_checkin
                FROM users_props 
                WHERE users_id = $1`
       
  db.one(query, [req.query.users_id])
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


function getHotelComments(req, res, next) {
  
  let query =  `SELECT c.*, up.first_name, up.last_name, up.avatar 
                FROM hotel_comments c
                JOIN users_props up ON up.users_id = c.users_id 
                WHERE c.hotels_id = $1`  

  let query2 = `SELECT COUNT(*) total_reviews, 
                                AVG(overal_rat) overal_rat, 
                                AVG(treatm_rat) treatm_rat, 
                                AVG(cleanness) cleanness, 
                                AVG(comfort) comfort, 
                                AVG(restaurant) restaurant, 
                                AVG(service) service, 
                                AVG(price_qual) price_qual, 
                                AVG(area) area
                FROM hotel_comments 
                WHERE hotels_id = $1`
  let query3 = `SELECT * FROM hotel_comments WHERE hotels_id = $1 `     
    
    db.tx(t => {
        return t.batch([
            t.any(query, [req.query.hotels_id]),
            t.any(query2, [req.query.hotels_id]),
            t.any(query3, [req.query.hotels_id]),
        ]);
    })
    .then(function (data) {
      res.status(200)
        .send({
          data: data[0],
          stats: data[1],
          comments: data[2],
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}



function getTursComments(req, res, next) {
  
  let query =  `SELECT c.*, up.first_name, up.last_name, up.avatar 
                FROM tur_comments c
                JOIN users_props up ON up.users_id = c.users_id 
                WHERE c.tur_id = $1`  

  let query2 = `SELECT COUNT(*) total_reviews, 
                                AVG(overal_rat) overal_rat, 
                                AVG(treatm_rat) treatm_rat, 
                                AVG(cleanness) cleanness, 
                                AVG(comfort) comfort, 
                                AVG(restaurant) restaurant, 
                                AVG(service) service, 
                                AVG(price_qual) price_qual, 
                                AVG(area) area
                FROM tur_comments 
                WHERE tur_id = $1`

  let query3 = `SELECT * FROM tur_comments WHERE tur_id = $1 `     
    
    db.tx(t => {
        return t.batch([
            t.any(query, [req.query.tur_id]),
            t.any(query2, [req.query.tur_id]),
            t.any(query3, [req.query.tur_id]),
        ]);
    })
    .then(function (data) {
      res.status(200)
        .send({
          data: data[0],
          stats: data[1],
          comments: data[2],
        });
    })
    .catch(function (err) {
       console.log(err)
       next(err)
    })
}


function addHotelComments(req, res, next) {
  
  let query = `INSERT INTO hotel_comments (hotels_id,users_id,overal_rat, treatm_rat,pluses,minuses, created)
                VALUES ($1,$2,$3,$4,$5,$6, NOW()::timestamp)`
       
  db.none(query, [req.body.hotels_id,req.body.users_id, req.body.overal_rat, req.body.treatm_rat, req.body.pluses, req.body.minuses])
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


function addTursComments(req, res, next) {
  
  let query = `INSERT INTO tur_comments (tur_id,users_id,overal_rat, treatm_rat,pluses,minuses, created)
                VALUES ($1,$2,$3,$4,$5,$6, NOW()::timestamp)`
       
  db.none(query, [req.body.tur_id,req.body.users_id, req.body.overal_rat, req.body.treatm_rat, req.body.pluses, req.body.minuses])
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


function getCancelationPolicy(req, res, next) {
  
  let query = `SELECT * FROM hotels_cancellation WHERE hotels_id = $1`
       
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

function updateCancalationPolicy(req, res, next) {
  
  let query =  `INSERT INTO hotels_cancellation (hotels_id, prep_needed, days_no_penalts, amount_penalt)
                VALUES ($1,$2,$3,$4)
                ON CONFLICT (hotels_id) DO UPDATE
                SET prep_needed = $2, days_no_penalts = $3, amount_penalt = $4`
       
  db.none(query, [req.body.users_id, req.body.prep_needed, req.body.days_no_penalts, req.body.amount_penalt])
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


function getRoomProps(req, res, next) {
  
  let query =  `SELECT n.dname, n.dname_ru, p.*
                FROM items_details_props p
                JOIN items_details_names n ON n.id = p.detail_id
                WHERE p.items_id = $1`
       
  db.any(query, [req.query.items_id])
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


function updateRoomProps(req, res, next) {
     
    db.tx(t => {
        const queries = req.body.listData.map(l => {

            let query = `INSERT INTO items_details_props(detail_id, items_id, is_available, is_free, ext_data) 
                              VALUES(${l.id}, ${req.body.item_id}, ${l.available}, ${l.free}, '${JSON.stringify(l.ext_data)}')
                              ON CONFLICT (items_id,detail_id) DO UPDATE 
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






module.exports = {
  getHotelsNames,
  getGeneralInfo,
  updateGeneralInfo,
  getPayments,
  updatePayments,
  getPriceConditions,
  addPriceConditions,
  updatePriceConditions,
  deletePriceConditions,
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  addPhotoToRoom,
  getPriceCategories,
  addPriceCategory,
  updatePriceCategory,
  deletePriceCategory,
  getPriceChildren,
  addPriceChildren,
  updatePriceChildren,
  deletePriceChildren,
  getPhotos,
  addPhoto,
  updatePhoto,
  deletePhoto,
  getCalendar,
  updateCalendarMaxRent,
  updateCalendarPrice,
  getSanatoriumsInSearch,
  getTreatments,
  updateTreatments,
  getSanatoriumPageData,
  getSanatoriumBookingData,
  getHotelComments,
  addHotelComments,
  getCancelationPolicy,
  updateCancalationPolicy,
  getRoomProps,
  updateRoomProps,
  getTursComments,
  addTursComments,
  getListHotels,
}