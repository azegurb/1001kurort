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

const currency = ['USD','RUB', 'AZN', 'KZT', 'EUR']

//db
const db = require(`../config`).db


function sendHotelInvoiceXlsxFile(res,sanat,orders){

	let monthlyTotalPrice = null,
		  monthlyTotalComission = null;

	var xl = require('excel4node');
	 
	// Create a new instance of a Workbook class
	var wb = new xl.Workbook();
	 
	// Add Worksheets to the workbook
	var ws = wb.addWorksheet('Invoice');

	// Create a reusable style
	var style = wb.createStyle({
		alignment: {
			horizontal: 'center'
		},
	    font: {
	        color: 'black',
	        size: 12
	    },
	});

	var title = {
			alignment: {
				horizontal: 'center',
			},		
			font: {
				size: 24,
				bold: true,
			},
		},
		hrStyle = { 
			alignment: {
				horizontal: 'center'
			},
			font: { 
				bold: true,
			} 
		},
		totalPrice = {
			alignment: {
				horizontal: 'center',
			},
			font: {
				color: '#0c351e',
			},
			fill: {
	            type: 'pattern',
	            patternType: 'solid',				
	            fgColor: '#49c407'
			}
		},
		earnPrice = {
			alignment: {
				horizontal: 'center',
			},
			font: {
				color: '#000000',
			},
			fill: {
	            type: 'pattern',
	            patternType: 'solid',				
	            fgColor: '#efd407'
			}
		};

	ws.row(1).setHeight(35);
	ws.cell(1,1 , 1,12, true).string(`Комиссия санатория ${sanat.h_sname}`).style(title);

	ws.column(1).setWidth(5);
	ws.column(2).setWidth(30);
	ws.column(3).setWidth(10);
	ws.column(4).setWidth(15);
	ws.column(5).setWidth(15);
	ws.column(6).setWidth(10);
	ws.column(7).setWidth(15);
	ws.column(8).setWidth(15);
	ws.column(9).setWidth(15);
	ws.column(10).setWidth(15);
	ws.column(11).setWidth(15);
	ws.column(12).setWidth(15);
	ws.column(13).setWidth(15);

	// table th
	ws.cell(3, 1).string('№').style(hrStyle);
	ws.cell(3, 2).string(`Имя фамилия гостя`).style(hrStyle);
	ws.cell(3, 3).string(`Гостей`).style(hrStyle);
	ws.cell(3, 4).string(`Дата заезда`).style(hrStyle);
	ws.cell(3, 5).string(`Дата выезда`).style(hrStyle);
	ws.cell(3, 6).string(`Ночей`).style(hrStyle);
	ws.cell(3, 7).string(`Цена за ночь`).style(hrStyle);
	ws.cell(3, 8).string(`% Комиссии`).style(hrStyle);
	ws.cell(3, 9).string(`Скидка гостю`).style(hrStyle);
	ws.cell(3, 10).string(`Оставшаяся комиссия`).style(hrStyle);
	ws.cell(3, 11).string(`Общая сумма`).style(hrStyle);
	ws.cell(3, 12).string(`Заработанная комиссия`).style(hrStyle);

	// orders for month
	orders.map( (item, index) => {
		let comission = (sanat.comission_percent - item.discount_percent) / 100 * item.total_price_default[0],
			totalPriceDefault = item.total_price_default[0];

		monthlyTotalPrice += totalPriceDefault;
		monthlyTotalComission += comission;

		ws.cell(4 + index, 1).number(index + 1).style(style);
		ws.cell(4 + index, 2).string(`${item.guest_contacts.name} ${item.guest_contacts.lastname}`).style(style);
		ws.cell(4 + index, 3).number(item.adults).style(style);
		ws.cell(4 + index, 4).date(item.date_start).style(style);
		ws.cell(4 + index, 5).date(item.date_end).style(style);
		ws.cell(4 + index, 6).number(item.nights_count).style(style);
		ws.cell(4 + index, 7).string(`${item.daily_price_default[0]} USD`).style(style);
		ws.cell(4 + index, 8).string(`${sanat.comission_percent} %`).style(style);
		ws.cell(4 + index, 9).string(item.discount_percent ? `${item.discount_percent} %` : '').style(style);
		ws.cell(4 + index, 10).string(`${sanat.comission_percent - item.discount_percent} %`).style(style);
		ws.cell(4 + index, 11).string(`${totalPriceDefault} USD`).style(style);
		ws.cell(4 + index, 12).string(`${comission} USD`).style(style);	
	})

	if(!orders.length) {
		ws.cell(4,1 , 4,12, true).string('Нет данных о бронировании');
	}

	ws.cell(4 + orders.length,1 , 4 + orders.length,10, true).string('Общая сумма').style(totalPrice);
	ws.cell(4 + orders.length,11).string(`${monthlyTotalPrice} USD`).style(Object.assign(totalPrice,{ font: { color: '#e50000' }}));
	ws.cell(4 + orders.length,12).string(`${monthlyTotalComission} USD`).style(earnPrice);

	wb.writeToBuffer().then(function (buffer) {
		res.send(buffer);
	})

}



function getHotelAvailableInvoices(req, res, next) {
  
  let query =  `SELECT * FROM invoices WHERE hotel_id = $1`
        
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


function downloadHotelInvoice(req, res, next) {
    
	let query1 =`SELECT  i.*,
				      	up.h_sname,
				       	up.comission_percent
				FROM invoices i
				JOIN users_props up ON up.users_id = i.hotel_id 
				WHERE i.inv_id = $1`,
		query2=`SELECT * 
				FROM orders o 
				JOIN orders_data d ON d.orders_id = o.id
				WHERE o.hotels_id = $1 AND o.status_id = 1 AND o.created BETWEEN $2 AND $3`;
	    
	db.tx(t => {
	    return t.batch([
	      t.one(query1, [req.params.id]),
	      t.any(query2, [req.query.hotel_id, req.query.start_date, req.query.end_date])
	    ]);
	})        
	.then(data => {
		const sanat  = data[0],
			  orders = data[1];

		sendHotelInvoiceXlsxFile(res, sanat, orders)
	})
	.catch(function (err) {
		console.log(err)
		next(err)
	})
}


function getCurrenciesRates(req, res, next) {
  
  let query =  `SELECT * FROM currencies_rates WHERE date = $1`;
        
  db.one(query, [req.query.date])
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


function updateCurrenciesRates(req, res, next) {
  
  let query =  `INSERT INTO currencies_rates (date,usd,rub,azn,kzt,eur) VALUES (NOW(),$1,$2,$3,$4,$5)`;
  
  db.none(query, [1, req.body.rub.rate, req.body.azn.rate, req.body.kzt.rate, req.body.eur.rate])
    .then(function (data) {

      res.status(200)
        .send({
          data: data
        });
    })
    .catch(function (err) {
       //console.log(err)
       next(err)
    })
}


function getLoadingScreen(req, res, next) {
  

  let filePath = path.join(__dirname, '../../config_files','/LoadingScreenConfig.json'),
  	  fileData = fs.readFileSync(filePath, 'utf8')

  const parsedData = JSON.parse(fileData);  

  res.status(200)
    .send({
      data: parsedData,
    });
}

function updateLoadingScreen(req, res, next) {
  
  let filePath = path.join(__dirname, '../../config_files','/LoadingScreenConfig.json');
  let fileData = JSON.stringify(req.body.data, null, 2);

  fs.writeFile(filePath, fileData, (err) => {
    
    if(err) console.log(err);

    res.status(200)
       .send({ data: 'success' });
  })
}


module.exports = {
	getHotelAvailableInvoices,
	downloadHotelInvoice,
	getCurrenciesRates,
	updateCurrenciesRates,
	getLoadingScreen,
	updateLoadingScreen,
}

