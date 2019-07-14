const initialState = {
	countries: [],
	kurorts: [],
	diseasesProfiles: [],
	events: [],
	siteStats: {},
	turs: [],
	turData: {},
	turReviews: [],
	turCommentStats: {},
	all_articles: [],
	random_bloggers: [],
	top_bloggers: [],
	latest_blog: {},
	latest_vlog: {},
	popular_blog: {},
	bloggerArticles: [],
	bloggerInfo: {},
	blogPostData: {},
	blogPostComments: [],
	doctorsList: [],
	blogFaqs: [],
	blogLastQuestions: [],
	sanatoriums: [],
	facilitiesNames: [],
	treatmentBaseNames: [],
	room_details_names: [],
	sanatoriumData: {},
	sanatoriumComments: [],
	sanatoriumCommentsStats: {},
	comparingSanatoriums: [],
	shares: [],
	dataLoaded: false,
};

export default function asyncData(state = initialState , action ) {
	switch (action.type) {

	    case 'GET_COUNTRIES_KURORTS':
	    	return { ...state, countries: action.countries, kurorts: action.kurorts };	 

	    case 'GET_DISEASES_PROFILES':
	    	return { ...state, diseasesProfiles: action.diseasesProfiles };

	    case 'GET_SITE_EVENTS':
	    	return { ...state, events: action.events };

	    case 'GET_SITE_STATS':
	    	return { ...state, siteStats: action.siteStats };	

	    case 'GET_TURS':
	    	return { ...state, turs: action.turs };

	    case 'GET_TUR_PAGE_DATA':
	    	return { ...state, turData: action.turData };

	    case 'GET_BLOGS_PAGE':
	    	return { ...state, 
	    		all_articles: action.all_articles, 
	    		random_bloggers: action.random_bloggers, 
	    		top_bloggers: action.top_bloggers, 
	    		latest_blog: action.latest_blog, 
	    		latest_vlog: action.latest_vlog, 
	    		popular_blog: action.popular_blog, 
	    	};	      

	    case 'GET_BLOGGER_PAGE':
	    	return { ...state, bloggerArticles: action.bloggerArticles, bloggerInfo: action.bloggerInfo };    

	    case 'GET_BLOG_POST':
	    	return { ...state, blogPostData: action.blogPostData };    

	    case 'GET_BLOG_POST_COMMENTS':
	    	return { ...state, blogPostComments: action.blogPostComments };

	    case 'GET_DOCTORS_LIST':
	    	return { ...state, doctorsList: action.doctorsList };

	    case 'GET_BLOG_FAQS':
	    	return { ...state, blogFaqs: action.blogFaqs };

	    case 'GET_BLOG_LAST_QUESTIONS':
	    	return { ...state, blogLastQuestions: action.blogLastQuestions };

	    case 'GET_SANATORIUMS':
	    	return { ...state, sanatoriums: action.sanatoriums };

	    case 'GET_FACILITIES_NAMES':
	    	return { ...state, facilitiesNames: action.facilitiesNames };

	    case 'GET_TREATMENT_BASE_NAMES':
	    	return { ...state, treatmentBaseNames: action.treatmentBaseNames };

	    case 'GET_ROOM_DETAILS_NAMES':
	    	return { ...state, room_details_names: action.room_details_names };

	    case 'GET_SANATORIUM_PAGE':
	    	return { ...state, sanatoriumData: action.sanatoriumData };

	    case 'GET_SANATORIUM_COMMENTS':
	    	return { ...state, sanatoriumComments: action.sanatoriumComments, sanatoriumCommentsStats: action.sanatoriumCommentsStats };

	    case 'SET_DATA_LOADED_TRUE':
	    	return { ...state, dataLoaded: true };

	    case 'SET_DATA_LOADED_FALSE':
	    	return { ...state, dataLoaded: false };

	    case 'GET_COMPARING_SANATORIUMS':
	    	return { ...state, comparingSanatoriums: action.comparingSanatoriums };

	    case 'GET_SHARES':
	    	return { ...state, shares: action.shares };
 
	    default:
		return state;
	}
  return state
}

