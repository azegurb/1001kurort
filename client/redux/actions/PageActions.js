export const SET_SEARCH_OPTION_VIS = 'SET_SEARCH_OPTION_VIS',
             SET_SEARCH_MIN_PRICE_VALUE = 'SET_SEARCH_MIN_AGE_VALUE',
             SET_SEARCH_MAX_PRICE_VALUE = 'SET_SEARCH_MAX_AGE_VALUE',
             SET_LOGIN_USER = 'SET_LOGIN_USER',
             SET_LOGOUT_USER = 'SET_LOGOUT_USER',
             SET_LOCATION = 'SET_LOCATION',
	         CHANGE_LANGUAGE = 'CHANGE_LANGUAGE',
	         CHANGE_CURRENCY = 'CHANGE_CURRENCY',
	         CHANGE_CURRENCY_RATES = 'CHANGE_CURRENCY_RATES',
	         SET_SEARCH_DATES= 'SET_SEARCH_DATES',
	         SET_BOOKED_DATA = 'SET_BOOKED_DATA',
	         SET_NAVIGATION_PATHS_NAMES = 'SET_NAVIGATION_PATHS_NAMES',
	         DELETE_BOOKING_DATA = 'DELETE_BOOKING_DATA',
	         UPDATE_PAGE_STATUS = 'UPDATE_PAGE_STATUS',
	         UPDATE_SEARCH_FILTERS = 'UPDATE_SEARCH_FILTERS';


let jwt_decode = require('jwt-decode');
let Cookies = require('universal-cookie');
let clientCookies = new Cookies();
let cookieOptions = {
    path: '/'
};
let cookieOptionsBooking = {
    path: '/booking'
};


export function setSearchOptionVis(value) {
	return {
		type: SET_SEARCH_OPTION_VIS,
		searchOptionVis: value
	}

}

export function setSearchMinAgeValue(value) {
	return {
		type: SET_SEARCH_MIN_PRICE_VALUE ,
		searchMinAgeValue: value
	}

}

export function setSearchMaxAgeValue(value) {
	return {
		type: SET_SEARCH_MAX_PRICE_VALUE ,
		searchMaxAgeValue: value
	}

}

export function loginUser(value){
    let savedJwt =  clientCookies.get('1001kurortUser');

	if (savedJwt !== value) {
        clientCookies.set('1001kurortUser', value, {...cookieOptions});
    }

	return {
		type: SET_LOGIN_USER ,
		user: jwt_decode(value)
	}

}

export function logoutUser(){
    clientCookies.remove('1001kurortUser', {...cookieOptions});

	return {
		type: SET_LOGOUT_USER,
		user: {}
	}

}

export function updateUser(){
    let savedJwt =  clientCookies.get('1001kurortUser');

	
	return {
		type: SET_LOGIN_USER ,
		user: savedJwt ? jwt_decode(savedJwt) : {}
	}	
}

export function changeLanguage(languageId){

	return {
		type: CHANGE_LANGUAGE ,
		languageId
	}
}

export function changeCurrency(currencyId){

	return {
		type: CHANGE_CURRENCY ,
		currencyId
	}
}

export function changeCurrencyRates(currencyRates){
	
	return {
		type: CHANGE_CURRENCY_RATES ,
		currencyRates
	}
}

export function setLocation(location){

	return {
		type: SET_LOCATION ,
		location
	}
}

export function setSearchDates(dayArrive, dayDepart, numberNights){

	return {
		type: SET_SEARCH_DATES ,
		dayArrive,
		dayDepart,
		numberNights
	}
}

export function setBookedData(details){

	return {
		type: SET_BOOKED_DATA ,
		details,
	}
}

export function setNavigationPathNames(navPartsNames){
	return {
		type: SET_NAVIGATION_PATHS_NAMES ,
		navPartsNames,
	}
}


export function deleteBookingData(){
    clientCookies.remove('BookedHotelsID', {...cookieOptionsBooking});
    clientCookies.remove('BookedStartDate', {...cookieOptionsBooking});
    clientCookies.remove('BookedEndDate', {...cookieOptionsBooking});
    clientCookies.remove('BookedNights', {...cookieOptionsBooking});
    clientCookies.remove('BookedRoomNumber', {...cookieOptionsBooking});
    clientCookies.remove('BookedAdults', {...cookieOptionsBooking});
    clientCookies.remove('BookedChilds', {...cookieOptionsBooking});
    clientCookies.remove('BookedGuests', {...cookieOptionsBooking});
    clientCookies.remove('BookedDefaultPrice', {...cookieOptionsBooking});
    clientCookies.remove('BookedPriceWithDiscount', {...cookieOptionsBooking});
    clientCookies.remove('BookedRoomsInfo', {...cookieOptionsBooking});
    clientCookies.remove('BookedShareRoom', {...cookieOptionsBooking});
	
	return {
		type: DELETE_BOOKING_DATA,
		details: {}
	}

}

export function updateIsLoadingPage(loading){

	return {
		type: UPDATE_PAGE_STATUS,
		loading,
	}
}

export function updateSearchFilters(filtersValues){

	return {
		type: UPDATE_SEARCH_FILTERS,
		filtersValues,
	}
}
