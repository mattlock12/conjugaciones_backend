import React from 'react';
import styled from 'styled-components';
import { capitalize } from 'lodash';

import {
  FIERY_ROSE,
  MINT,
  GAINSBORO,
  TURQUOISE,
  ROYAL_PURPLE
 } from '../constants/StyleConstants';


const TenseSelectorStyles = styled.div`
width: 100%;

.tense-selector-body {
  display: flex;
  flex-direction: column;
}

.tense-category-holder {
  display: flex;
  flex-direction: column;
}

.tense-category-name {
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.tense-category-tenses {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 5px;
}
`
const Tense = styled.div`
text-align: center;
font-size:  12px;
padding: 5px;
border-radius: 7px;
margin: 2px 2.5px;
background: ${props => props.active ? TURQUOISE : FIERY_ROSE };
color: ${props => props.active ? 'white' : 'white' };
border: 1px solid ${props => props.active ? TURQUOISE : 'white' };

&:hover {
  cursor: pointer;
  border: 1px solid white;
  background: white;
  color: ${props => props.active ? TURQUOISE : FIERY_ROSE };
}
`

export default ({ tenses, tensesWithCategories, toggleSelectedTense }) => (
  <TenseSelectorStyles>
    <div className='tense-selector-title'>Tense/Mood</div>
    <div className='tense-selector-body'>
    {
      tenses && tensesWithCategories && Object.keys(tensesWithCategories).map(category =>
        <div className='tense-category-holder'>
          <div className='tense-category-name'>{category}</div>
          <div className='tense-category-tenses'>
          {
            tensesWithCategories[category].map((t) => {
              if (t in tenses) {
                return (
                  <Tense
                    className='tense'
                    key={ t }
                    name={ t }
                    active={ tenses[t] }
                    onClick={ () => toggleSelectedTense({ ...tenses, [t]: !tenses[t] }) }
                  >{ capitalize(t) }
                  </Tense>
                );
              } else {
                return null;
              }
            })
          }
          </div>
        </div>
      )
    }
    </div>
  </TenseSelectorStyles>
)