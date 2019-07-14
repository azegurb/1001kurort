import React, { Component } from 'react'
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'

const youTubeOpt = {
    frameBorder: 0, 
    allowFullScreen: true,
    width: '100%',
};

const PrevNextStyles = {
	
	container: {
	},

	iconStyle: {
		width: 36, 
		height: 36, 
		border: '1px solid #fff', 
		borderRadius: 30
	},

	buttonStyle: {
		width: 36, 
		height: 36, 
		position: 'absolute',
		margin: 'auto',
		bottom: 0,
		top: 0 
	},
};

const PrevNextButtons = ({ onChange, disabled }) => {
	return (
		<div style={PrevNextStyles.container}>
		  <IconButton 
		  	disabled={disabled}
			iconStyle={Object.assign({ right: 25 }, PrevNextStyles.iconStyle)}
			style={Object.assign({ right: 25 }, PrevNextStyles.buttonStyle)}
			children={
			  <ChevronRight color='#fff' hoverColor='#3594c0'/>
			} 
			onClick={() => onChange('next')}/>
		  <IconButton 
		  	disabled={disabled}
			iconStyle={Object.assign({ left: 5 }, PrevNextStyles.iconStyle)}
			style={Object.assign({ left: 5 }, PrevNextStyles.buttonStyle)}
			children={
			   <ChevronLeft color='#fff' hoverColor='#3594c0'/>
			} 
			onClick={() => onChange('prev')}/>
		</div>
	)
}					

export default class YouTubeSlider extends Component {
	
	constructor(props) {
		super(props);

		this.state = { blockIndex: 0 }

		this.handleChangeVideo = ::this.handleChangeVideo;
	}	

	handleChangeVideo(action) {
		
		if(action === 'next'){
			this.setState({ blockIndex: this.state.blockIndex === this.props.videos.length -1 ? 0 : this.state.blockIndex +1 });
		}
		else if(action === 'prev'){
			this.setState({ blockIndex: this.state.blockIndex === 0 ? this.props.videos.length -1 : this.state.blockIndex -1 });
		}
	}

	render() {
		const { videos, languageId } = this.props;
		const videoId = videos[this.state.blockIndex];
		const height = this.props.height || 300;

        return( 
        	videos.length ? 
				<div style={{ position: 'relative', width: '100%', height: height, margin: 'auto' }}>
					<iframe
							{ ...Object.assign({ height }, youTubeOpt)}
							src={`https://www.youtube.com/embed/${videoId}`} />  

					<PrevNextButtons disabled={videos.length <= 1 ? true : false} onChange={this.handleChangeVideo}/> 
				</div>
		    : 	<div style={{ marginTop: 120 }}>{ languageId === 0 ? 'Videos were not found' : 'Видео не найдены'}</div>
		)
	}

}
