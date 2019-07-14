import React, { Component } from 'react'
import PropTypes from 'prop-types';

class ResponsiveGrid extends React.Component {
    
    getChildContext(){
        return {
            serverSideScreenClass: this.props.serverSideScreenClass,
            breakpoints: [576, 768, 800, 1200],
        }
    }

    render() {
        return( 
            <div>
                {this.props.children}
            </div>
        )
    }
}

ResponsiveGrid.propTypes = {
    serverSideScreenClass: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
}

ResponsiveGrid.defaultProps = {
    serverSideScreenClass: 'xl',
}

ResponsiveGrid.childContextTypes = {
    serverSideScreenClass: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    breakpoints: PropTypes.arrayOf(PropTypes.number),
}

export default ResponsiveGrid;