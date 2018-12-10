import React, { Component } from 'react';
import { hot } from 'react-hot-loader';

import Entry from './Entry';

class App extends Component {
    render () {
        return (<Entry />);
    }
}

export default hot(module)(App);
