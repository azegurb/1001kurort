import { combineReducers } from 'redux'
import page from './Page'
import search from './Search'
import profile from './Profile'
import booking from './Booking'
import asyncData from './AsyncData'

const quotesApp = combineReducers({
	page,
    search,
    profile,
    booking,
    asyncData
});

export default quotesApp