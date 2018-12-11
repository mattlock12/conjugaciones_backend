import React, { Component } from 'react';


export default class AppHeader extends Component {
    render() {
        return (
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '50px' }}>
                <h1>Entend.ió</h1>
                <p style={{ paddingLeft: '30px', fontSize: '12px' }}>Choose tense / mood combos below</p>
            </div>
        )
    }
}