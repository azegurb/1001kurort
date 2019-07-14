import _ from 'lodash'

export default (asyncData, path) => {

	const {
	  bloggerInfo,
	  blogPostData,
	  turData,
	  sanatoriumData
	} = asyncData

	switch(path){

	    case '/blog/:id':
			if(_.isEmpty(bloggerInfo)) return {};

	    	return { 
	    		name: bloggerInfo.last_name && bloggerInfo.first_name 
	    				? `${bloggerInfo.last_name} ${bloggerInfo.first_name}` 
	    				: `Anonim`,
	    		image: bloggerInfo.avatar
	    	};

	    case '/blog/:bloggerId/:articleId':
			if(_.isEmpty(blogPostData)) return {};
	    	
	    	return { 
	    		name: blogPostData.title, 
	    		author: blogPostData.last_name && blogPostData.first_name 
	    				? `${blogPostData.last_name} ${blogPostData.first_name}` 
	    				: `Anonim`,
	    		image: blogPostData.is_blog
	    		  ? blogPostData.image[0]
	    		: blogPostData.video[0],
	    		description: blogPostData.text.length > 150 ? `${blogPostData.text.slice(0, 150)}...` : blogPostData.text
	    	};

	    case '/turs/:id':
			if(_.isEmpty(turData)) return {};
	    	
	    	return { 
	    		name: asyncData.turData.name,
	    		image: asyncData.turData.photos[0].original
	    	};

	    case '/sanatorium':
			if(_.isEmpty(sanatoriumData)) return {};
	    	
	    	return { name: asyncData.sanatoriumData.general && asyncData.sanatoriumData.general.h_sname };

	    default:
		return {};		
	}
}