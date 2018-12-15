import React from 'react';
import styled from 'styled-components';

const AppHeader = styled.div`
    display: flex;
    align-items: center;
    padding-left: 50px;

    .describer {
        padding-left: 30px;
        font-size: 12px;
    }
`

export default () => (
    <AppHeader>
        <h1>Entend.ió</h1>
        <div className='describer'>Choose tense / mood combos below</div>
    </AppHeader>
)