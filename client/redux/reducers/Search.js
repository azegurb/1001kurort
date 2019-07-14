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

export default function search(state = initialState , action ) {
    switch (action.type) {
    	
		case 'SET_SEARCH_DATES' :
		    return { ...state, dayArrive: action.dayArrive, dayDepart: action.dayDepart, numberNights: action.numberNights };
        
        case 'CHANGE_CURRENCY_RATES' :
            clientCookies.set('1001kurortRateUSD', JSON.stringify(action.currencyRates.USD), {...cookieOptionsDailyUpdate});
            clientCookies.set('1001kurortRateRUB', JSON.stringify(action.currencyRates.RUB), {...cookieOptionsDailyUpdate});
            clientCookies.set('1001kurortRateAZN', JSON.stringify(action.currencyRates.AZN), {...cookieOptionsDailyUpdate});
            clientCookies.set('1001kurortRateKZT', JSON.stringify(action.currencyRates.KZT), {...cookieOptionsDailyUpdate});
            clientCookies.set('1001kurortRateEUR', JSON.stringify(action.currencyRates.EUR), {...cookieOptionsDailyUpdate});
            return {
		        ...state,
                currencyRates: action.currencyRates
		    };
        
        case 'UPDATE_SEARCH_FILTERS' :
            return { ...state, filtersValues: action.filtersValues };

        default:
            return state;
    }
    return state
}