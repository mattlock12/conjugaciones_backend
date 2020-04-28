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


export default ({ title, activeTenses, toggleTense }) => (
  <TenseHeader>
    <div>{title}</div>
    <div className='tense-holder'>
      {
        Object.keys(activeTenses).map((t) => {
          if (t in activeTenses) {
            return (
              <Tense
                key={ t }
                name={ t }
                active={ activeTenses[t] }
                onClick={ () => toggleTense(t) }
              >{ capitalize(t) }</Tense>
            );
          } else {
            return null;
          }
        })
      }
    </div>
  </TenseHeader>
)
