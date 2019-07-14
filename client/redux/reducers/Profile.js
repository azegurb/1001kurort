import CookieDough from 'cookie-dough';

const initialState = {};

let cookieOptions = {
    path: '/',
    maxAge: 5184000
};

let clientCookies = null;

if(typeof window !== undefined){
	clientCookies = CookieDough();
}


export default function profile(state = initialState , action ) {
	switch (action.type) {
		
		case 'SET_LOGIN_USER' :
		    return { ...state, user: action.user };

		case 'SET_LOGOUT_USER' :
		    return { ...state, user: action.user };

        case 'CHANGE_LANGUAGE' :
            clientCookies.set('1001kurortLanguage', JSON.stringify(action.languageId), {...cookieOptions});
            return {
		        ...state,
                languageId: action.languageId
		    };

        case 'CHANGE_CURRENCY' :
            clientCookies.set('1001kurortCurrency', JSON.stringify(action.currencyId), {...cookieOptions});
            return {
		        ...state,
                currencyId: action.currencyId
		    };

		default:
		return state;
	}
  return state
}
