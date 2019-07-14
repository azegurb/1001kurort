import React from 'react'
import LoadingScreen from 'react-loading-screen'
import axios from 'axios'

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

class LoadingPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      randomFraseIndex: null
    }
  }

  componentDidMount() {
    axios.get('/api/loading-screen')
      .then( res => {

        let data = res.data.data

        this.setState({ 
          data,  
          randomFraseIndex: getRndInteger(0, data.frases.length -1)
        })
      })
  }

  render() {
    const {
      loading,
      languageId,
      children
    } = this.props;

    const { data, randomFraseIndex } = this.state;
    
    let text;
    if(data.showFrases && typeof window !== 'undefined'){
      text = languageId === 0 ? data.frases[randomFraseIndex].en : data.frases[randomFraseIndex].ru
    }

    return (
      <LoadingScreen 
        loading={loading}
        backgroundColor='#0000000a'
        spinnerColor='#ffa53a'
        textColor='#057bb2'
        logoSrc={data.logo}
        text={text}
        logoRounded={true}
      >
        {children}
      </LoadingScreen>
    )
  }
}

export default LoadingPage