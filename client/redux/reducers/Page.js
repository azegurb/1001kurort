const initialState = {
	loading: true,
	errorOnPage: null,
	navPartsNames: []
};

export default function Page(state = initialState , action ) {
	switch (action.type) {

	    case 'UPDATE_PAGE_STATUS':
	    	return { ...state, loading: action.loading };

	    case 'SET_NAVIGATION_PATHS_NAMES':
	    	return { ...state, navPartsNames: action.navPartsNames };

	    default:
		return state;
	}
  return state
}

