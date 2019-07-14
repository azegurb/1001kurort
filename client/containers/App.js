import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import {  renderRoutes } from 'react-router-config';
import { matchPath } from 'react-router';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as pageActions from '../redux/actions/PageActions'

import Header from '../components/Header'
import Footer from '../components/Footer'
import ResponsiveGrid from '../components/ResponsiveGrid'
import MetaPage from '../components/MetaPage'
import LoadingPage from '../components/LoadingPage'

import NotFound from '../containers/NotFound'
import ErrorPage from '../containers/ErrorPage'

import NavigationBar from '../components/NavigationBar'

import 'isomorphic-fetch';

const showNav = (pathname) => {
    let showRoutes = [ 
        { path: '/', exact: true },
        { path: '/search', exact: true },
        { path: '/comparing', exact: true },
        { path: '/sanatorium', exact: false },
        { path: '/booking', exact: true },
        { path: '/ask_doctor', exact: false },
        { path: '/funny_satellite', exact: true },
        { path: '/blog', exact: true },
        { path: '/blog/:id', exact: true },
        { path: '/blog/:bloggerId/:articleId', exact: true },
        { path: '/turs', exact: true },
        { path: '/turs/:id', exact: true },
    ];
    let foundPath = null;

    let isShow = showRoutes.find( ({ path, exact }) =>
        matchPath(pathname, { path, exact, strict: true }) ? true : false
    );

    return isShow;
}

class App extends React.Component {

	render() {

        const metaData = this.props.metaData || {};
        const {location} = this.props;
        const {loading} = this.props.page;
        const languageId = this.props.profile.languageId - 0;

		return(	
			<MetaPage metaData={metaData} location={location}>
				<ResponsiveGrid>
					<LoadingPage loading={loading} languageId={languageId}>
                        <Header/>
                        <main>
                            {showNav(location.pathname) && <NavigationBar />} 
                            {renderRoutes(this.props.route.routes)}
                        </main>
                        <Footer/>
                    </LoadingPage>
				</ResponsiveGrid>
			</MetaPage>
		)
	}
}

const mapStateToProps = ({ page, profile }) => ({
  page,
  profile
})

export default connect(mapStateToProps, null)(App)