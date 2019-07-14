import CookieDough from 'cookie-dough';

const initialState = {}
	
const cookieOptionsDailyUpdate = {
    path: '/',
    maxAge: 86400
};

let clientCookies = null;

if(typeof window !== undefined){
      clientCookies = CookieDough();
}

export default function booking(state = initialState , action ) {
	switch (action.type) {
		
		case 'SET_BOOKED_DATA' :
            clientCookies.set('BookedHotelsID', JSON.stringify(action.details.hotels_id), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedTurID', JSON.stringify(action.details.tur_id), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedStartDate', JSON.stringify(action.details.start_date), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedEndDate', JSON.stringify(action.details.end_date), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedNights', JSON.stringify(action.details.nights), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedRoomNumber', JSON.stringify(action.details.room_number), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedAdults', JSON.stringify(action.details.adults), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedChilds', JSON.stringify(action.details.childs), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedGuests', JSON.stringify(action.details.guests), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedDefaultPrice', JSON.stringify(action.details.totalPrice.default_price), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedPriceWithDiscount', JSON.stringify(action.details.totalPrice.price_with_discount), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedRoomsInfo', JSON.stringify(action.details.rooms), {...cookieOptionsDailyUpdate});
            clientCookies.set('BookedShareRoom', JSON.stringify(action.details.shareRoom), {...cookieOptionsDailyUpdate});
	    
	    	return { ...state, details: action.details };

	    case 'DELETE_BOOKING_DATA' :
	    	return { ...state, details: action.details };

		default:
		return state;
	}

  return state
}