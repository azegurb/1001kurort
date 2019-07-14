import React, { Component } from 'react'
import {Col, Row, Container, ScreenClassRender, Visible, Hidden} from 'react-grid-system'
import { Link } from 'react-router-dom'
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import Brightness from 'material-ui/svg-icons/image/brightness-1'
import Divider from 'material-ui/Divider'
import axios from 'axios'

import YouTubeSlider from './YouTubeSlider'

export default class VideoYouTube extends Component {
	
  constructor(props) {
    super(props);

    this.state =  {
    	videos: [],
    }

    this.axiosGetAdminVideos = ::this.axiosGetAdminVideos;
  }
    
  componentWillMount() {
    this.axiosGetAdminVideos()
  } 

  axiosGetAdminVideos() {
      axios.get('/api/admin/get-videos')
           .then( response => this.setState({ videos: response.data.data.map( item => item.url) }) )
  }

  render() {
    
    const languageId = this.props.languageId

    return(
      <YouTubeSlider 
        videos={this.state.videos} 
        height={300}
        languageId={languageId}/>
    )
  }
}