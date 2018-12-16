import React, { Component } from 'react';
import styled from 'styled-components';

import AppHeader from './AppHeader';
import VerbContainer from './VerbContainer';

const StyledEntry = styled.div`
  @media (max-width: 900px) {
    width: 90%;
  }
`


export default class Container extends Component {
  render() {
    return (
      <StyledEntry>
        <AppHeader />
        <VerbContainer />
      </StyledEntry>
    )   
  }
}
