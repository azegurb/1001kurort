import React, { Component } from 'react'
import {Helmet} from 'react-helmet';
import { connect } from 'react-redux'
import axios from 'axios'
import _ from 'lodash'
import { matchRoutes } from 'react-router-config'
import routes from '../Routes'

import getMetaParams from '../RoutesAsyncParams'

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

function toStringWithParams(str='', params={}){
    var compiled = _.template(str);
    return compiled(params);
}


class MetaPage extends Component { 
    
    constructor(props) {
        super(props);

        this.state = {
            metaData: this.props.metaData || {},
            allMetaData: []
        }
    }

    componentWillReceiveProps(nextProps){

        let path = matchRoutes(routes, nextProps.location.pathname)[1].match.path
        
        axios.get(`/api/site-pages`)
             .then( res =>

                this.setState({ 
                    allMetaData: res.data.pages,
                    metaData: _.find(res.data.pages, { path }) 
                })
             )
             .catch( err => console.log(err))
    }


    render(){

        const {children, location, languageId, asyncData} = this.props
        const {metaData} = this.state;
        const path = matchRoutes(routes, this.props.location.pathname)[1].match.path;
        const metaAsyncParams = getMetaParams(asyncData, path);

        return(
            <div>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>{
                        languageId === 0 
                          ? toStringWithParams(metaData.titleEN, metaAsyncParams) 
                        : toStringWithParams(metaData.titleRU, metaAsyncParams)
                    }</title>
                    <meta name="description" content={
                        toStringWithParams(
                         languageId === 0 ? metaData.descriptionEN : metaData.descriptionRU
                        , metaAsyncParams)
                    }/>
                    <meta name="keywords" content={metaData.keywords}/>
                    <meta property="fb:app_id" content="123715308261227"/>
                    <meta property="og:title" content={
                        toStringWithParams(
                         languageId === 0 ? metaData.titleEN : metaData.titleRU
                        , metaAsyncParams)
                    }/>
                    <meta property="og:description" content={
                        languageId === 0 
                          ? toStringWithParams(metaData.descriptionEN, metaAsyncParams)
                        : toStringWithParams(metaData.descriptionRU, metaAsyncParams)
                    }/>
                    <meta property="og:image" content={
                        metaAsyncParams.image 
                          ? metaAsyncParams.image
                        : process.env.API_URL + '/public/images/logo.png'
                    }/>
                    <meta property="og:type" content="article"/>
                    <meta property="og:url" content= {process.env.API_URL || 'https://1001kurort.com' + location.pathname} />
                </Helmet>

                {children}
            </div>
        )
    }
}

const mapStateToProps = ({ profile, asyncData }) => ({
    profile,
    asyncData
});

export default connect(mapStateToProps, null)(MetaPage);