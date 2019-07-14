// Bundles.js

import syncComponent from './lib/syncComponent';

export const App = syncComponent('App', require('./containers/App'));
export const Home = syncComponent('Home', require('./containers/Home'));
export const Comparing = syncComponent('Comparing', require('./containers/Comparing'));
export const SanatoriumPage = syncComponent('SanatoriumPage', require('./containers/SanatoriumPage'));
export const AskDoctor = syncComponent('AskDoctor', require('./containers/AskDoctor'));
export const FunnySatellite = syncComponent('FunnySatellite', require('./containers/FunnySatellite'));
export const Blog = syncComponent('Blog', require('./containers/Blog'));
export const Turs = syncComponent('Turs', require('./containers/Turs'));
export const TurPage = syncComponent('TurPage', require('./containers/TurPage'));
export const BloggerPage = syncComponent('BloggerPage', require('./containers/BloggerPage'));
export const BloggerPostPage = syncComponent('BloggerPostPage', require('./containers/BloggerPostPage'));
export const Auth = syncComponent('Auth', require('./containers/Auth'));
export const Register = syncComponent('Register', require('./containers/Register'));
export const Booking = syncComponent('Booking', require('./containers/Booking'));
export const CancelBooking = syncComponent('CancelBooking', require('./containers/CancelBooking'));
export const Confirm = syncComponent('Confirm', require('./containers/Confirm'));
export const Search = syncComponent('Search', require('./containers/Search'));
export const Logout = syncComponent('Logout', require('./containers/Logout'));
export const NotFound = syncComponent('NotFound', require('./containers/NotFound'));
export const TermsAndConditions = syncComponent('TermsAndConditions', require('./containers/TermsAndConditions'));
export const AdminAuthForm = syncComponent('AdminAuthForm', require('./admin/components/AdminAuthForm'));
export const AdminDashboard = syncComponent('AdminDashboard', require('./admin/containers/AdminDashboard'));
export const AccountTypeHandler = syncComponent('AccountTypeHandler', require('./components/AccountTypeHandler'));