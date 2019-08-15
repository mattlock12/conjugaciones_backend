import React from 'react';
import styled from 'styled-components';
import { capitalize } from 'lodash';

const TenseHeader = styled.div`
  width: 90%;

  .tense-holder {
    display: flex;
    flex-wrap: wrap;
  }
`;


const Tense = styled.div`
  text-align: center;
  font-size:  12px;
  padding: 5px;
  border-radius: 7px;
  margin: 2px 2.5px;
  background: ${props => props.active ? '#4cd0ba' :  'white'};
  color: ${props => props.active ? 'white' : 'black' };
  border: 1px solid transparent;

  &:hover {
    cursor: pointer;
    border: 1px solid ${props => props.active ? 'transparent' : 'blue' };
    background: ${props => props.active ? '#4cd0ba' : 'white' };
    color: ${props => props.active ? 'white' : 'blue '};
  }
`


export default ({ activeTenses, toggleTense }) => (
  <TenseHeader>
    <div>Mood / Tense combos</div>
    <div className='tense-holder'>
      {
        Object.keys(activeTenses).map((tense) => {
          return (
            <Tense
              key={ tense }
              name={ tense }
              active={ activeTenses[tense] }
              onClick={ () => toggleTense(tense) }
            >{ capitalize(tense) }</Tense>
          )
        })
      }
    </div>
  </TenseHeader>
)
