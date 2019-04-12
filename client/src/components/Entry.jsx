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
    let language = window.location.search.split('=')[1];
    language = language ? language.toUpperCase() : 'ES';

    return (
      <StyledEntry>
        <AppHeader language={language} />
        <VerbContainer language={language} />
      </StyledEntry>
    )   
  }
}
