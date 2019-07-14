// AsyncBundles.js

import asyncComponent from './lib/asyncComponent';

export const App = asyncComponent('App', () => import('./containers/App'));
export const Home = asyncComponent('Home', () => import('./containers/Home'));
export const Comparing = asyncComponent('Comparing', () => import('./containers/Comparing'));
export const SanatoriumPage = asyncComponent('SanatoriumPage', () => import('./containers/SanatoriumPage'));
export const AskDoctor = asyncComponent('AskDoctor', () => import('./containers/AskDoctor'));
export const FunnySatellite = asyncComponent('FunnySatellite', () => import('./containers/FunnySatellite'));
export const Blog = asyncComponent('Blog', () => import('./containers/Blog'));
export const Turs = asyncComponent('Turs', () => import('./containers/Turs'));
export const TurPage = asyncComponent('TurPage', () => import('./containers/TurPage'));
export const BloggerPage = asyncComponent('BloggerPage', () => import('./containers/BloggerPage'));
export const BloggerPostPage = asyncComponent('BloggerPostPage', () => import('./containers/BloggerPostPage'));
export const Auth = asyncComponent('Auth', () => import('./containers/Auth'));
export const Register = asyncComponent('Register', () => import('./containers/Register'));
export const Booking = asyncComponent('Booking', () => import('./containers/Booking'));
export const CancelBooking = asyncComponent('CancelBooking', () => import('./containers/CancelBooking'));
export const Confirm = asyncComponent('Confirm', () => import('./containers/Confirm'));
export const Search = asyncComponent('Search', () => import('./containers/Search'));
export const Logout = asyncComponent('Logout', () => import('./containers/Logout'));
export const NotFound = asyncComponent('NotFound', () => import('./containers/NotFound'));
export const TermsAndConditions = asyncComponent('TermsAndConditions', () => import('./containers/TermsAndConditions'));
export const AdminAuthForm = asyncComponent('AdminAuthForm', () => import('./admin/components/AdminAuthForm'));
export const AdminDashboard = asyncComponent('AdminDashboard', () => import('./admin/containers/AdminDashboard'));
export const AccountTypeHandler = asyncComponent('AccountTypeHandler', () => import('./components/AccountTypeHandler'));