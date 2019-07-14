/* global window, document */
import React from 'react';
import ReactDOM from 'react-dom';
import { renderToString } from 'react-dom/server';
//import { elementToString } from 'fast-react-render';
import { BrowserRouter, StaticRouter } from 'react-router-dom';
import { matchPath } from 'react-router';
import { matchRoutes, renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux'
import CookieDough from 'cookie-dough';
import jwt_decode from 'jwt-decode';
import helmet from 'react-helmet';
import { createStore, applyMiddleware } from 'redux';
import injectTapEventPlugin from 'react-tap-event-plugin'
import { MuiThemeProvider, createMuiTheme, createGenerateClassName } from 'material-ui/styles';
import JssProvider from 'react-jss/lib/JssProvider';
import { SheetsRegistry } from 'react-jss/lib/jss';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'
import _ from 'lodash'

import reducers from './redux/reducers';
import thunk from './redux/middleware/thunk';
import {getInitialState, checkCurrencies, checkCountryLang} from './redux/initStore'

import renderServer from './renderServer';
import routesMeta from '../config_files/RoutesMeta.json'
import routes from './Routes'
import store from './redux/store'
import muiTheme from './mui-theme'
import App from './containers/App';
import ScrollToTop from './ScrollToTop'


const isClient = typeof document !== 'undefined';

if (isClient) {

  injectTapEventPlugin();

  ReactDOM.render(
    <Provider store={store}> 
      <BrowserRouter> 
        <MuiThemeProvider muiTheme={muiTheme}>
          <ScrollToTop>   
            {renderRoutes(routes)}
          </ScrollToTop>   
        </MuiThemeProvider>
      </BrowserRouter>
    </Provider>
  , document.getElementById('root'));

}

const serverMiddleware = async(req, res) => {

  //////////////////////////////////////////////
  // SOME PREPAYMENT AND INITIALIZING
  //////////////////////////////////////////////
  const cookies = new CookieDough(req);
  const initialState = await getInitialState(cookies);
  // sheet for styled-components
  const sheet = new ServerStyleSheet()
  const store = createStore(reducers, initialState, applyMiddleware(thunk));


  ///////////////////////////////////////////////
  // ROUTING AND PREFETCH
  ///////////////////////////////////////////////

  let foundPath = null;
  
  let { path, component } = routes[0].routes.find(
    ({ path, exact }) => {
      foundPath = matchPath(req._parsedUrl.pathname,
        {
          path,
          exact,
          strict: false
        }
      )
      return foundPath;
    }) || {};

  if (!component)
    component = {};

  if (!component.defaultProps.fetchData)
    component.defaultProps.fetchData = () => new Promise(resolve => resolve());

  let metaData = _.find(routesMeta, { path }) || {};

  await component.defaultProps.fetchData({ store, params: (foundPath ? foundPath.params : {}), query: req.query });


  ////////////////////////////////
  // Content of renderer page
  ////////////////////////////////

  let preloadedState = store.getState();
  
  let context = {
    splitPoints: [],
  };

  // init stylesheet for styled-components
  const styledComponentsTags = sheet.getStyleTags()
  
  const head = helmet.renderStatic();
  
  const css = {};

  
  const markup = (
    <Provider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <StyleSheetManager sheet={sheet.instance}>
          <StaticRouter location={req.url} context={context}>
            <ScrollToTop>
              <div style={{ display: 'none' }}>
                {renderRoutes(routes, { metaData })}
              </div>
            </ScrollToTop>   
          </StaticRouter>
        </StyleSheetManager>
      </MuiThemeProvider>
    </Provider>
  );

  const content = renderToString(markup);

  ////////////////////////////////
  // RESPONSE
  ////////////////////////////////

  if (context.status === 404) {
    res.status(404);
  }  
  if (context.status === 500) {
    res.status(500);
  }
  if (context.status === 302) {
    return res.redirect(302, context.url);
  }

  res.send(renderServer(context, content, head, css, preloadedState, styledComponentsTags));

}

export default serverMiddleware;











 