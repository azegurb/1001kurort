import axios from 'axios'
import _ from 'lodash'

const API_URL = process.env.API_URL || ''

// API *****************************

function getCountriesAndKurortsFromAPI() {
    return axios
        .get(`${API_URL}/api/countries-kurorts-names`)
        .then( res => {

            let countries = [], kurorts = []
            
            res.data.kurorts.map( kurort => {
                kurorts.push(kurort.id)
            })

            res.data.countries.map( country => {
                country.cities = _.filter(res.data.kurorts, { country_id : country.id })
                countries.push(country)
            })

            return { countries, kurorts };
        })
        .catch( err => console.log(err) );
}


function getDiseasesProfilesFromAPI() {

    const treatmentProfilesIMG = require('../../api/tursData').treatmentProfilesIMG;
    
    return axios.get(`${API_URL}/api/disease-profiles-names`)
            .then(res => 

                res.data.data = res.data.data.map( item => {
                    item.img = _.find( treatmentProfilesIMG, {key: item.id }) ? _.find( treatmentProfilesIMG, {key: item.id}).path : null;
                    return item; 
                })
            )
            .catch( err => console.log(err) );
}


function getSiteEventsFromAPI() {
    return axios.get(`${API_URL}/api/site/events`)
            .then(res => res.data)
            .catch( err => console.log(err) );
}


function getSiteStatsFromAPI() {
    return axios.get(`${API_URL}/api/site-stats`)
            .then(res => res.data)
            .catch( err => console.log(err) );
}


function getTursFromAPI(currencyRates) {

    const includes = require('../../api/tursData').includes

    return axios.get(`${API_URL}/api/turs`)
            .then(res => res.data.data)
            .then( data =>

                data = data.map( item => {
                    let defaultPriceIntoUSD = null,
                        priceWithDiscountIntoUSD = null

                        item.included = item.included.map( itemIncl => 
                            itemIncl = _.find(includes, { id: itemIncl })
                        )

                    switch(item.price_currency){
                        case 0: 
                            defaultPriceIntoUSD = item.price_values[1] / currencyRates.USD
                            priceWithDiscountIntoUSD = item.price_values[1] * (100 - item.discount_percent)/ 100 / currencyRates.USD
                            break 
                        case 1: 
                            defaultPriceIntoUSD = item.price_values[1] / currencyRates.RUB
                            priceWithDiscountIntoUSD = item.price_values[1] * (100 - item.discount_percent)/ 100 / currencyRates.RUB
                            break 
                        case 2: 
                            defaultPriceIntoUSD = item.price_values[1] / currencyRates.AZN
                            priceWithDiscountIntoUSD = item.price_values[1] * (100 - item.discount_percent)/ 100 / currencyRates.AZN
                            break
                        case 3: 
                            defaultPriceIntoUSD = item.price_values[1] / currencyRates.KZT
                            priceWithDiscountIntoUSD = item.price_values[1] * (100 - item.discount_percent)/ 100 / currencyRates.KZT
                            break
                        case 4: 
                            defaultPriceIntoUSD = item.price_values[1] / currencyRates.EUR
                            priceWithDiscountIntoUSD = item.price_values[1] * (100 - item.discount_percent)/ 100 / currencyRates.EUR
                            break
                    }

                    item.totalPriceNoDiscount = [
                        (defaultPriceIntoUSD || 0).toFixed(2), 
                        (defaultPriceIntoUSD * currencyRates.RUB / 2 || 0).toFixed(1),
                        (defaultPriceIntoUSD * currencyRates.AZN / 2 || 0).toFixed(1),
                        (defaultPriceIntoUSD * currencyRates.KZT / 2 || 0).toFixed(1),
                        (defaultPriceIntoUSD * currencyRates.EUR / 2 || 0).toFixed(1)
                    ]

                    if(item.discount_percent){

                        item.totalPriceDiscount = [
                            (priceWithDiscountIntoUSD || 0).toFixed(2), 
                            (priceWithDiscountIntoUSD * currencyRates.RUB / 2 || 0).toFixed(1),
                            (priceWithDiscountIntoUSD * currencyRates.AZN / 2 || 0).toFixed(1),
                            (priceWithDiscountIntoUSD * currencyRates.KZT / 2|| 0).toFixed(1),
                            (priceWithDiscountIntoUSD * currencyRates.EUR / 2|| 0).toFixed(1)
                        ]                   
                    }

                        return item;
                })
            )
            .catch( err => console.log(err) );
}

function getTurPageDataFromAPI(id, currencyRates) {
    
    const includes = require('../../api/tursData').includes
    const subjects = require('../../api/tursData').subjects

    return axios.get(`${API_URL}/admin/turs/single`, {
                params: {
                    id,
                }
            })
            .then( res => {
               
                let data = {};
                
                if(res.status === 200){
                    data = res.data.data
                    
                    let defaultPriceIntoUSD = null,
                        priceWithDiscountIntoUSD = null

                    data.included = data.included.map( itemIncl =>
                        itemIncl = _.find(includes, { id: itemIncl })
                    )

                    data.notIncluded = _.forEach( includes, item => data.included.indexOf(item.id) === -1 )

                    data.subjects = data.subjects.map( itemIncl =>
                        itemIncl = _.find(subjects, { id: itemIncl })
                    )

                    data.photos = data.photos.map( item => 
                        item = {
                            original: item,
                            thumbnail: item,
                        }
                    )

                    data.price_values = data.price_values.map( price => {

                        let prices = []


                        switch(data.price_currency){
                            case 0: 
                                defaultPriceIntoUSD = price / currencyRates.USD
                                priceWithDiscountIntoUSD = price * (100.0 - data.discount_percent) / 100 / currencyRates.USD
                                break 
                            case 1: 
                                defaultPriceIntoUSD = price / currencyRates.RUB
                                priceWithDiscountIntoUSD = price * (100.0 - data.discount_percent) / 100 / currencyRates.RUB
                                break 
                            case 2: 
                                defaultPriceIntoUSD = price / currencyRates.AZN
                                priceWithDiscountIntoUSD = price * (100.0 - data.discount_percent) / 100 / currencyRates.AZN
                                break
                            case 3: 
                                defaultPriceIntoUSD = price / currencyRates.KZT
                                priceWithDiscountIntoUSD = price * (100.0 - data.discount_percent) / 100 / currencyRates.KZT
                                break
                            case 4: 
                                defaultPriceIntoUSD = price / currencyRates.EUR
                                priceWithDiscountIntoUSD = price * (100.0 - data.discount_percent) / 100 / currencyRates.EUR
                                break
                        }


                        prices = [
                            (priceWithDiscountIntoUSD || 0).toFixed(2), 
                            (priceWithDiscountIntoUSD * currencyRates.RUB || 0).toFixed(1),
                            (priceWithDiscountIntoUSD * currencyRates.AZN || 0).toFixed(1),
                            (priceWithDiscountIntoUSD * currencyRates.KZT || 0).toFixed(1),
                            (priceWithDiscountIntoUSD * currencyRates.EUR || 0).toFixed(1)
                        ]                   

                        return prices
                    })
                    return data;
                }
            })
            .catch( err => console.log(err) );
}

function getTurCommentsFromAPI(tur_id) {
    return axios.get(`${API_URL}/api/turs/comments`, {
                params: {
                    tur_id,
                }
            })
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getBlogsPageFromAPI() {
    return axios.get(`${API_URL}/api/blog`)
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getBloggerPageFromAPI(id) {
    return axios.get(`${API_URL}/api/blogger`, {
                params: {
                    author_id: id
                }
            })
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getBlogPostDataFromAPI(bloggerId, articleId) {
    return axios.get(`${API_URL}/api/blogger/article`, {
                params: {
                    bloggerId,
                    articleId
                }
            })
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getBlogPostCommentsFromAPI(articleId) {
    return axios.get(`${API_URL}/api/blogger/article/comments`, {
                params: {
                    articleId           
                }
            })
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getDoctorsListFromAPI() {
    return axios.get(`${API_URL}/api/doctors`)
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getBlogFaqsFromAPI() {
    return axios.get(`${API_URL}/admin/ask-doctor/faq`)
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getBlogLastQuestionsFromAPI() {
    return axios.get(`${API_URL}/api/admin/ask-doctor/questions`)
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getBlogLastQuestionsClosedFromAPI() {
    return axios.get(`${API_URL}/api/admin/ask-doctor/questions/closed`)
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getTreatmentBaseNamesFromAPI() {
    return axios.get(`${API_URL}/api/hotels-treatments-names`)
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getRoomDetailsNamesFromAPI() {
    return axios.get(`${API_URL}/api/items-details-names`)
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getFacilitiesNamesFromAPI() {
    return axios.get(`${API_URL}/api/hotels-facilities-names`)
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getSanatoriumsFromAPI(params, currencyRates) {

    return axios.get(`${API_URL}/api/sanatoriums/search`, {
                params,
            })
            .then(res => res.data.data)
            .then(sanatoriums => {

                sanatoriums.map( item => {

                    item.chipest_room = item.rooms.map( room => 
                        _.minBy(room, 'default_price')
                    )
                   
                    //console.log(_.minBy(item.rooms, 'default_price'))
                    //console.log(_.minBy(item.rooms, 'price_with_discount'))
                    
                    let totalPrice = null;
                    let totalPercent = 0;

                    if(item.chipest_room) {

                      item.chipest_room.map( chipest_room => {
                        let defaultPriceIntoUSD = null,
                            priceWithDiscountIntoUSD = null

                        switch(chipest_room.currency){
                            case 0: 
                                defaultPriceIntoUSD = chipest_room.default_price / currencyRates.USD
                                priceWithDiscountIntoUSD = chipest_room.price_with_discount && ( chipest_room.price_with_discount / currencyRates.USD )
                                break 
                            case 1: 
                                defaultPriceIntoUSD = chipest_room.default_price / currencyRates.RUB
                                priceWithDiscountIntoUSD = chipest_room.price_with_discount && ( chipest_room.price_with_discount / currencyRates.RUB )
                                break 
                            case 2: 
                                defaultPriceIntoUSD = chipest_room.default_price / currencyRates.AZN
                                priceWithDiscountIntoUSD = chipest_room.price_with_discount && ( chipest_room.price_with_discount / currencyRates.AZN )
                                break
                            case 3: 
                                defaultPriceIntoUSD = chipest_room.default_price / currencyRates.KZT
                                priceWithDiscountIntoUSD = chipest_room.price_with_discount && ( chipest_room.price_with_discount / currencyRates.KZT )
                                break
                            case 4: 
                                defaultPriceIntoUSD = chipest_room.default_price / currencyRates.EUR
                                priceWithDiscountIntoUSD = chipest_room.price_with_discount && ( chipest_room.price_with_discount / currencyRates.EUR )
                                break
                        }

                        chipest_room.default_price = [
                            (defaultPriceIntoUSD || 0).toFixed(2), 
                            (defaultPriceIntoUSD * currencyRates.RUB || 0).toFixed(2),
                            (defaultPriceIntoUSD * currencyRates.AZN || 0).toFixed(2),
                            (defaultPriceIntoUSD * currencyRates.KZT || 0).toFixed(2),
                            (defaultPriceIntoUSD * currencyRates.EUR || 0).toFixed(2)
                        ]

                        if(chipest_room.price_with_discount) {
                            chipest_room.price_with_discount = [
                                (priceWithDiscountIntoUSD || 0).toFixed(2), 
                                (priceWithDiscountIntoUSD * currencyRates.RUB || 0).toFixed(2),
                                (priceWithDiscountIntoUSD * currencyRates.AZN || 0).toFixed(2),
                                (priceWithDiscountIntoUSD * currencyRates.KZT || 0).toFixed(2),
                                (priceWithDiscountIntoUSD * currencyRates.EUR || 0).toFixed(2)
                            ]                   
                        }

                        totalPrice += chipest_room.price_with_discount 
                            ? parseFloat(chipest_room.price_with_discount[0]) 
                            : parseFloat(chipest_room.default_price[0])

                        totalPercent += chipest_room.percent
                      })
                    }

                    item.totalPrice = totalPrice;
                    item.totalPercent = totalPercent;


                })

                sanatoriums = _.sortBy(sanatoriums, 'totalPrice');

                return sanatoriums;
            })
            .catch(err => console.log(err));
}

function getSanatoriumPageFromAPI(params, currencyRates) {
    return axios.get(`${API_URL}/api/search/sanatorium-page`, {
                params,
            })
            .then(res => {

                if(res.data.error) return;

                let general = res.data.general[0], 
                    treatmentData = [
                        { values: [], category: ['Surveys', 'Обследования'] },
                        { values: [], category: ['Healing Procedures', 'Лечебные процедуры'] },
                        { values: [], category: ['Equipment', 'Оборудование'] },
                        { values: [], category: ['Natural products', 'Натуральные продукты'] },
                    ],
                    treatmentProfile = [
                        { values: res.data.main_profile, category: ['Main profile', 'Основной профиль'] },
                        { values: res.data.secondary_profile, category: ['Secondary profile', 'Второстепенный профиль'] },
                    ],
                    plusesMinuses = { 
                        pluses: res.data.pluses_minuses_about ? res.data.pluses_minuses_about.h_pluses : [], 
                        minuses: res.data.pluses_minuses_about ? res.data.pluses_minuses_about.h_minuses : [] 
                    },
                    sanatoriumAbout = { 
                        text: res.data.pluses_minuses_about ? res.data.pluses_minuses_about.about : [],  
                        text_ru: res.data.pluses_minuses_about ? res.data.pluses_minuses_about.about : []
                    },
                    facilities = { free: [],  paid: [] },
                    photos = [],
                    videos = res.data.pluses_minuses_about.h_videos || [],
                    rooms_details = res.data.rooms_details,
                    rooms = res.data.rooms || []

                    rooms = rooms.map( (roomArray,index) =>  
                        roomArray.rooms.map( room => {
                        if(room.default_price !=='null'){

                            let defaultPriceIntoUSD = null,
                                priceWithDiscountIntoUSD = null

                            switch(room.currency){
                                case 0: 
                                    defaultPriceIntoUSD = parseInt(room.default_price) / currencyRates.USD
                                    priceWithDiscountIntoUSD = room.price_with_discount && ( room.price_with_discount / currencyRates.USD )
                                    break 
                                case 1: 
                                    defaultPriceIntoUSD = parseInt(room.default_price) / currencyRates.RUB
                                    priceWithDiscountIntoUSD = room.price_with_discount && ( room.price_with_discount / currencyRates.RUB )
                                    break 
                                case 2: 
                                    defaultPriceIntoUSD = parseInt(room.default_price) / currencyRates.AZN
                                    priceWithDiscountIntoUSD = room.price_with_discount && ( room.price_with_discount / currencyRates.AZN )
                                    break
                                case 3: 
                                    defaultPriceIntoUSD = parseInt(room.default_price) / currencyRates.KZT
                                    priceWithDiscountIntoUSD = room.price_with_discount && ( room.price_with_discount / currencyRates.KZT )
                                    break
                                case 4: 
                                    defaultPriceIntoUSD = parseInt(room.default_price) / currencyRates.EUR
                                    priceWithDiscountIntoUSD = room.price_with_discount && ( room.price_with_discount / currencyRates.EUR )
                                    break
                            }

                            room.default_price = [
                                parseInt( (defaultPriceIntoUSD).toFixed(2) ), 
                                parseInt( (defaultPriceIntoUSD * currencyRates.RUB).toFixed(2) ),
                                parseInt( (defaultPriceIntoUSD * currencyRates.AZN).toFixed(2) ),
                                parseInt( (defaultPriceIntoUSD * currencyRates.KZT).toFixed(2) ),
                                parseInt( (defaultPriceIntoUSD * currencyRates.EUR).toFixed(2) )
                            ]

                            if(room.price_with_discount){

                                room.price_with_discount = [
                                    parseInt( (priceWithDiscountIntoUSD).toFixed(2) ), 
                                    parseInt( (priceWithDiscountIntoUSD * currencyRates.RUB).toFixed(2) ),
                                    parseInt( (priceWithDiscountIntoUSD * currencyRates.AZN).toFixed(2) ),
                                    parseInt( (priceWithDiscountIntoUSD * currencyRates.KZT).toFixed(2) ),
                                    parseInt( (priceWithDiscountIntoUSD * currencyRates.EUR).toFixed(2) )
                                ]                   
                            }
                        }

                        return room
                        })
                    )

                    console.log(rooms)

                    res.data.treatment_base.map( item => { 
                            
                            switch( item.category ){
                                case 0: 
                                    treatmentData[0].values.push({ label : [item.name, item.name_ru] })
                                    break
                                case 1: 
                                    treatmentData[1].values.push({ label : [item.name, item.name_ru] })
                                    break
                                case 2: 
                                    treatmentData[2].values.push({ label : [item.name, item.name_ru] })
                                    break
                                case 4: 
                                    treatmentData[3].values.push({ label : [item.name, item.name_ru] })
                                    break
                            }
                    })

                    res.data.photoVideos.map( item => {
                        if(item.cat_id === 1){
                            videos.push(item)
                        }else {
                            photos.push({ 
                                id: item.id,
                                original: item.url,
                                thumbnail: item.url,
                            })
                        }
                    })

                    res.data.facilities.map( item => {
                        if(item.is_free){
                            facilities.free.push(item)
                        }else facilities.paid.push(item)
                    })

                    return {
                        general, 
                        treatmentData, 
                        treatmentProfile, 
                        plusesMinuses, 
                        sanatoriumAbout, 
                        rooms, 
                        rooms_details, 
                        photos, 
                        videos, 
                        facilities
                    };
            })
            .catch(err => console.log(err));
}

function getSanatoriumCommentsFromAPI(hotels_id) {
    return axios.get(`${API_URL}/api/hotels/comments`, {
                params: { 
                    hotels_id,
                }
            })
            .then(res => res.data)
            .catch(err => console.log(err));
}

function getComparingSanatoriumsFromAPI(params) {
    return axios.get(`${API_URL}/api/compares`, {
                params,
            })
            .then(res => res.data)
            .catch(err => console.log(err));
}


function getSharesFromAPI() {
    return axios.get(`${API_URL}/api/banners`)
            .then(res => res.data)
            .catch(err => console.log(err));
}



// ALL FUNCTIONS 

export function getCountriesAndKurorts(){
    return async function (dispatch, getState) {
        let {kurorts, countries} = await getCountriesAndKurortsFromAPI();

        dispatch({ type: 'GET_COUNTRIES_KURORTS', kurorts, countries });
    }
}

export function getDiseasesProfiles(){

    return async function (dispatch, getState) {
        let data = await getDiseasesProfilesFromAPI();

        dispatch({ type: 'GET_DISEASES_PROFILES', diseasesProfiles: data });
    }
}

export function getSiteEvents(){
    return async function (dispatch, getState) {
        let {data} = await getSiteEventsFromAPI();

        dispatch({ type: 'GET_SITE_EVENTS', events: data });
    }
}

export function getSiteStats(){
    return async function (dispatch, getState) {
        let {data} = await getSiteStatsFromAPI();

        dispatch({ type: 'GET_SITE_STATS', siteStats: data });
    }
}

export function getTurs(currencyRates){

    return async function (dispatch, getState) {
        let data = await getTursFromAPI(currencyRates);

        dispatch({ type: 'GET_TURS', turs: data });
    }
}

export function getTurPageData(id, currencyRates){

    return async function (dispatch, getState) {
        let data = await getTurPageDataFromAPI(id, currencyRates);

        dispatch({ type: 'GET_TUR_PAGE_DATA', turData: data });
    }
}

export function getTurComments(id){

    return async function (dispatch, getState) {
        let {data, stats} = await getTurCommentsFromAPI(id);

        dispatch({ type: 'GET_TUR_COMMENTS', turReviews: data, turCommentStats: stats });
    }
}

export function getBlogsPage(id){

    return async function (dispatch, getState) {
        let data = await getBlogsPageFromAPI(id);

        dispatch({ type: 'GET_BLOGS_PAGE', 
            all_articles:    data.all_articles, 
            random_bloggers: data.random_bloggers, 
            top_bloggers:    data.top_bloggers, 
            latest_blog:     data.latest_blog && data.latest_blog[0], 
            latest_vlog:     data.latest_vlog && data.latest_vlog[0], 
            popular_blog:    data.popular_blog && data.popular_blog[0], 
        });
    }
}

export function getBloggerPage(id){

    return async function (dispatch, getState) {
        let {data} = await getBloggerPageFromAPI(id);

        dispatch({ type: 'GET_BLOGGER_PAGE', bloggerArticles: data[0], bloggerInfo: data[1] });
    }
}

export function getBlogPostData(bloggerId, articleId){

    return async function (dispatch, getState) {
        let {data} = await getBlogPostDataFromAPI(bloggerId, articleId);

        dispatch({ type: 'GET_BLOG_POST', blogPostData: data });
    }
}

export function getBlogPostComments(articleId){

    return async function (dispatch, getState) {
        let {data} = await getBlogPostCommentsFromAPI(articleId);

        dispatch({ type: 'GET_BLOG_POST_COMMENTS', blogPostComments: data });
    }
}

export function getDoctorsList(){

    return async function (dispatch, getState) {
        let {data} = await getDoctorsListFromAPI();

        dispatch({ type: 'GET_DOCTORS_LIST', doctorsList: data });
    }
}

export function getBlogFaqs(){

    return async function (dispatch, getState) {
        let {data} = await getBlogFaqsFromAPI();

        dispatch({ type: 'GET_BLOG_FAQS', blogFaqs: data });
    }
}

export function getBlogLastQuestions(){

    return async function (dispatch, getState) {
        let {data} = await getBlogLastQuestionsFromAPI();

        dispatch({ type: 'GET_BLOG_LAST_QUESTIONS', blogLastQuestions: data });
    }
}

export function getBlogLastQuestionsClosed(){

    return async function (dispatch, getState) {
        let {data} = await getBlogLastQuestionsClosedFromAPI();

        dispatch({ type: 'GET_BLOG_LAST_QUESTIONS', blogLastQuestions: data });
    }
}

export function getFacilitiesNames(){

    return async function (dispatch, getState) {
        let {data} = await getFacilitiesNamesFromAPI();

        dispatch({ type: 'GET_FACILITIES_NAMES', facilitiesNames: data });
    }
}

export function getTreatmentBaseNames(){

    return async function (dispatch, getState) {
        let {data} = await getTreatmentBaseNamesFromAPI();

        dispatch({ type: 'GET_TREATMENT_BASE_NAMES', treatmentBaseNames: data });
    }
}

export function getRoomDetailsNames(){

    return async function (dispatch, getState) {
        let {data} = await getRoomDetailsNamesFromAPI();

        dispatch({ type: 'GET_ROOM_DETAILS_NAMES', room_details_names: data });
    }
}

export function getSanatoriums(params, currencyRates={}){

    return async function (dispatch, getState) {
        dispatch({ type: 'SET_DATA_LOADED_FALSE' });

        let data = await getSanatoriumsFromAPI(params, currencyRates);

        dispatch({ type: 'GET_SANATORIUMS', sanatoriums: data });
        dispatch({ type: 'SET_DATA_LOADED_TRUE' });
    }
}

export function getSanatoriumPage(params, currencyRates={}){

    return async function (dispatch, getState) {
        dispatch({ type: 'SET_DATA_LOADED_FALSE' });
        
        let data = await getSanatoriumPageFromAPI(params, currencyRates);

        if(!data) return;
            
        dispatch({ type: 'GET_SANATORIUM_PAGE', sanatoriumData: data });
        dispatch({ type: 'SET_DATA_LOADED_TRUE' });
    }
}

export function getSanatoriumComments(id){

    return async function (dispatch, getState) {
        let {data, stats} = await getSanatoriumCommentsFromAPI(id);

        dispatch({ type: 'GET_SANATORIUM_COMMENTS', sanatoriumComments: data, sanatoriumCommentsStats: stats });
    }
}


export function getComparingSanatoriums(params){

    return async function (dispatch, getState) {
        let {data} = await getComparingSanatoriumsFromAPI(params);

        dispatch({ type: 'GET_COMPARING_SANATORIUMS', comparingSanatoriums: data });
    }
}



export function getShares(){

    return async function (dispatch, getState) {
        let {data} = await getSharesFromAPI();

        dispatch({ type: 'GET_SHARES', shares: data });
    }
}
