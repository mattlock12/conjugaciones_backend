import React, { Component } from 'react';

import AppHeader from './AppHeader';
import VerbContainer from './VerbContainer';


export default class Container extends Component {
    render() {
        return (
            <>
                <AppHeader />
                <VerbContainer />
            </>
        )   
    }
}