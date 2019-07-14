//import React from 'react';
//import loadable from 'loadable-components';
//import Async from 'react-code-splitting'

import {
  App, 
  Home, 
  Comparing,
  SanatoriumPage,
  AskDoctor,
  FunnySatellite,
  Blog,
  Turs,
  TurPage,
  BloggerPage,
  BloggerPostPage,
  Auth,
  Register,
  Booking,
  CancelBooking,
  Confirm,
  Search,
  Logout,
  NotFound,
  TermsAndConditions,
  AdminAuthForm,
  AdminDashboard,
  AccountTypeHandler,
} from './Bundles';

/*
import App from './containers/App';
import Home from './containers/Home';
import Comparing from './containers/Comparing';
import SanatoriumPage from './containers/SanatoriumPage';
import AskDoctor from './containers/AskDoctor';
import FunnySatellite from './containers/FunnySatellite';
import Blog from './containers/Blog';
import Turs from './containers/Turs';
import TurPage from './containers/TurPage';
import BloggerPage from './containers/BloggerPage';
import BloggerPostPage from './containers/BloggerPostPage';
import Auth from './containers/Auth';
import Register from './containers/Register';
import Booking from './containers/Booking';
import CancelBooking from './containers/CancelBooking';
import Confirm from './containers/Confirm';
import Search from './containers/Search';
import Logout from './containers/Logout';
import NotFound from './containers/NotFound';
import TermsAndConditions from './containers/TermsAndConditions';
import AdminAuthForm from './admin/components/AdminAuthForm';
import AdminDashboard from './admin/containers/AdminDashboard';
import AccountTypeHandler from './components/AccountTypeHandler';
*/

/*
const App = loadable(() => import('./containers/App'));
const Home = loadable(() => import('./containers/Home'));
const Comparing = loadable(() => import('./containers/Comparing'));
const SanatoriumPage = loadable(() => import('./containers/SanatoriumPage'));
const AskDoctor = loadable(() => import('./containers/AskDoctor'));
const FunnySatellite = loadable(() => import('./containers/FunnySatellite'));
const Blog = loadable(() => import('./containers/Blog'));
const Turs = loadable(() => import('./containers/Turs'));
const TurPage = loadable(() => import('./containers/TurPage'));
const BloggerPage = loadable(() => import('./containers/BloggerPage'));
const BloggerPostPage = loadable(() => import('./containers/BloggerPostPage'));
const Auth = loadable(() => import('./containers/Auth'));
const Register = loadable(() => import('./containers/Register'));
const Booking = loadable(() => import('./containers/Booking'));
const CancelBooking = loadable(() => import('./containers/CancelBooking'));
const Confirm = loadable(() => import('./containers/Confirm'));
const Search = loadable(() => import('./containers/Search'));
const Logout = loadable(() => import('./containers/Logout'));
const NotFound = loadable(() => import('./containers/NotFound'));
const TermsAndConditions = loadable(() => import('./containers/TermsAndConditions'));
const AdminAuthForm = loadable(() => import('./admin/components/AdminAuthForm'));
const AdminDashboard = loadable(() => import('./admin/containers/AdminDashboard'));
const AccountTypeHandler = loadable(() => import('./components/AccountTypeHandler'));
*/

/*

const App = () => <Async load={import('./containers/App')}/>
const Home = () => <Async load={import('./containers/Home')}/>
const Comparing = () => <Async load={import('./containers/Comparing')}/>
const SanatoriumPage = () => <Async load={import('./containers/SanatoriumPage')}/>
const AskDoctor = () => <Async load={import('./containers/AskDoctor')}/>
const FunnySatellite = () => <Async load={import('./containers/FunnySatellite')}/>
const Blog = () => <Async load={import('./containers/Blog')}/>
const Turs = () => <Async load={import('./containers/Turs')}/>
const TurPage = () => <Async load={import('./containers/TurPage')}/>
const BloggerPage = () => <Async load={import('./containers/BloggerPage')}/>
const BloggerPostPage = () => <Async load={import('./containers/BloggerPostPage')}/>
const Auth = () => <Async load={import('./containers/Auth')}/>
const Register = () => <Async load={import('./containers/Register')}/>
const Booking = () => <Async load={import('./containers/Booking')}/>
const CancelBooking = () => <Async load={import('./containers/CancelBooking')}/>
const Confirm = () => <Async load={import('./containers/Confirm')}/>
const Search = () => <Async load={import('./containers/Search')}/>
const Logout = () => <Async load={import('./containers/Logout')}/>
const NotFound = () => <Async load={import('./containers/NotFound')}/>
const TermsAndConditions = () => <Async load={import('./containers/TermsAndConditions')}/>
const AdminAuthForm = () => <Async load={import('./admin/components/AdminAuthForm')}/>
const AdminDashboard = () => <Async load={import('./admin/containers/AdminDashboard')}/>
const AccountTypeHandler = () => <Async load={import('./components/AccountTypeHandler')}/>
*/

const routes = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: Home,
      },
      {
        path: '/search',
        exact: false,
        component: Search,
      },
      {
        path: '/comparing',
        exact: false,
        component: Comparing,
      },
      {
        path: '/sanatorium',
        exact: false,
        component: SanatoriumPage,
      },
      {
        path: '/booking',
        exact: true,
        component: Booking,
      },
      {
        path: '/ask_doctor',
        exact: false,
        component: AskDoctor,
      },
      {
        path: '/funny_satellite',
        exact: true,
        component: FunnySatellite,
      },
      {
        path: '/blog',
        exact: true,
        component: Blog,
      },
      {
        path: '/blog/:id',
        exact: true,
        component: BloggerPage,
      },
      {
        path: '/blog/:bloggerId/:articleId',
        exact: true,
        component: BloggerPostPage,
      },
      {
        path: '/turs',
        exact: true,
        component: Turs,
      },
      {
        path: '/turs/:id',
        exact: true,
        component: TurPage,
      },
      {
        path: '/register/',
        exact: false,
        component: Register,
      },
      {
        path: '/auth/',
        exact: false,
        component: Auth,
      },
      {
        path: '/profile',
        exact: true,
        component: AccountTypeHandler,
      },
      {
        path: '/account/confirm/:id',
        exact: true,
        component: Confirm,
      },
      {
        path: '/booking/cancel/:id',
        exact: true,
        component: CancelBooking,
      },
      {
        path: '/terms-and-conditions',
        exact: true,
        component: TermsAndConditions,
      },
      {
        path: '/secret/admin/auth',
        exact: true,
        component: AdminAuthForm,
      },
      {
        path: '/secret/dashboard',
        exact: true,
        component: AdminDashboard,
      },
      {
        path: '*',
        exact: true,
        component: NotFound,
      },
    ]
  }
];

export default routes;