let jwt_decode = require('jwt-decode');
let axios = require('axios');

function getInitialState(cookies){
	
	return Promise.all([checkCountryLang(cookies),checkCurrencies(cookies)])
		.then( () => {

			return {
				profile: {
					user : cookies.get('1001kurortUser') ? jwt_decode(cookies.get('1001kurortUser')) : {},
					languageId: cookies.get('1001kurortLanguage') || '0',
					currencyId: cookies.get('1001kurortCurrency') || '0',
					locationPathNames: [],
				},
				booking: {
					details: {
						hotels_id: parseInt(cookies.get('BookedHotelsID')) || null,
						start_date: (cookies.get('BookedStartDate')) ? (cookies.get('BookedStartDate')).replace(/['"]+/g, '') : null,
						end_date: (cookies.get('BookedEndDate')) ? (cookies.get('BookedEndDate')).replace(/['"]+/g, '') : null,
						nights: parseInt(cookies.get('BookedNights')) || 0,
						room_number: parseInt(cookies.get('BookedRoomNumber')) || 0,
						guests: JSON.parse(cookies.get('BookedGuests') || null) || null,
						adults: parseInt(cookies.get('BookedAdults')) || 0,
						childs: parseInt(cookies.get('BookedChilds')) || 0,
						babies: parseInt(cookies.get('BookedBabies')) || 0,
						childs_ages: parseInt(cookies.get('BookedChildsAges')) || [],
						totalPrice : { 
							default_price : eval(cookies.get('BookedDefaultPrice')) || [null,null,null,null,null],
							price_with_discount: eval(cookies.get('BookedPriceWithDiscount')) || [null,null,null,null,null],
						},
						rooms : cookies.get('BookedRoomsInfo') ? JSON.parse(cookies.get('BookedRoomsInfo')) : [],
						shareRoom: Boolean(cookies.get('BookedShareRoom')) || false,
						tur_id: parseInt(cookies.get('BookedTurID') || 0)
					},
				},
				search: {
					dayArrive : null,
					dayDepart : null,
					numberNights: null,
					currencyRates: {
						'USD' : 1.0,
						'RUB' : parseFloat(cookies.get('1001kurortRateRUB')),
						'AZN' : parseFloat(cookies.get('1001kurortRateAZN')),
						'KZT' : parseFloat(cookies.get('1001kurortRateKZT')),
						'EUR' : parseFloat(cookies.get('1001kurortRateEUR')),
					},
					filtersValues: {
				        priceFrom: [0,0,0,0,0],
				        priceTo: [5000,5000,5000,5000,5000],
				        stars: [],
				        diseasesProfiles: [],
				        facilities: [],
				        treatmentBase: [],
				        roomDetails: [],
				    },
				},

			}
		})
}

function checkCurrencies(cookies){

	if (!cookies.get('1001kurortRateUSD') || 
		!cookies.get('1001kurortRateRUB') || 
		!cookies.get('1001kurortRateAZN') || 
		!cookies.get('1001kurortRateKZT') ||
		!cookies.get('1001kurortRateEUR') ){
		
		console.log('CURRENCIES UPDATED')

		return axios.get(`${process.env.API_URL}/api/currencies-rates`, {
			params: {
				date: new Date()
			}
		}).then( res => {
			let currencies = res.data.data;

			cookies.set('1001kurortRateUSD', currencies.usd)
			cookies.set('1001kurortRateRUB', currencies.rub)
			cookies.set('1001kurortRateAZN', currencies.azn)
			cookies.set('1001kurortRateKZT', currencies.kzt)
			cookies.set('1001kurortRateEUR', currencies.eur)

		})
		.catch( err => {
			console.log(err);

			fetchCurrenciesRates(cookies).then( () =>

				axios.get(`${process.env.API_URL}/api/currencies-rates`, {
					params: {
						date: new Date()
					}
				}).then( res => {
					let currencies = res.data.data;

					cookies.set('1001kurortRateUSD', currencies.usd)
					cookies.set('1001kurortRateRUB', currencies.rub)
					cookies.set('1001kurortRateAZN', currencies.azn)
					cookies.set('1001kurortRateKZT', currencies.kzt)
					cookies.set('1001kurortRateEUR', currencies.eur)
				})
				.catch( err => console.log(err) )
			)
		})
	}
	return new Promise(resolve => resolve());
}

function checkCountryLang(cookies){

	if (!cookies.get('1001kurortLanguage') || !cookies.get('1001kurortCurrency') ){
	
	console.log('COUNTRY UPDATED')
	
	return axios.get('https://ipinfo.io/json')
	    .then(res => {
			
			let currencyId = 0, languageId = 0;
	        
	        switch (res.data.country) {

	            case 'US' :
	                currencyId = 0;
	                languageId = 0;
	                break;
	            case 'RU' :
	                currencyId = 1;
	                languageId = 1;
	                break;
	            case 'UA' :
	                currencyId = 0;
	                languageId = 1;
	                break;
	            case 'AZ' :
	                currencyId = 2;
	                languageId = 1;
	                break;
	            case 'KZ' :
	                currencyId = 3;
	                languageId = 1;
	                break;
	            case 'FR' :
	                currencyId = 4;
	                languageId = 0;
	                break;
	            case 'KG' :
	                currencyId = 1;
	                languageId = 0;
	                break;
	            case 'TM' :
	                currencyId = 1;
	                languageId = 0;
	                break;
	            case 'GE' :
	                currencyId = 1;
	                languageId = 0;
	                break;
	            default:
	                currencyId = 0;
	                languageId = 0;
	                break;
	        }

	    	cookies.set('1001kurortLanguage', languageId);
	    	cookies.set('1001kurortCurrency', currencyId);
	    })
		.catch( err => console.log(err))
	}
	return new Promise(resolve => resolve());
}


function fetchCurrenciesRates(cookies) {
    fetch('http://www.floatrates.com/daily/usd.json')
      .then(res => res.json())
      .then(currencyRates => {

        console.log('CURRENT RATES HAS BEEN UPDATED');

        axios
          .post(`${process.env.API_URL}/api/currencies-rates/update`, currencyRates)
          .catch( err => console.log(err))

      })
      .catch( err => console.log(err))
}

module.exports = {
	getInitialState,
	checkCurrencies,
	checkCountryLang,
}

