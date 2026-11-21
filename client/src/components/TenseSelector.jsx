import React from 'react';
import styled from 'styled-components';
import capitalize from 'lodash/capitalize';

import {
  ACCENT,
  ACCENT_SOFT,
  LABEL,
  SECONDARY_LABEL,
  SEPARATOR,
  SURFACE_TRANSLUCENT,
} from '../constants/StyleConstants';


const TenseSelectorStyles = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 16px 24px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .tense-selector-title {
    font-size: 15px;
    font-weight: 600;
    margin: 6px 0 2px;
  }

  .tense-category-name {
    margin: 14px 0 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: ${SECONDARY_LABEL};
  }

  .tense-category-tenses {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
`

const Tense = styled.button`
  padding: 4px 10px;
  border-radius: 999px;
  border: 0.5px solid ${props => props.$active ? ACCENT : SEPARATOR};
  background: ${props => props.$active ? ACCENT : SURFACE_TRANSLUCENT};
  color: ${LABEL};
  font-size: 12px;
  font-weight: ${props => props.$active ? 600 : 400};
  line-height: 1.3;
  cursor: pointer;
  transition: background .15s, color .15s, transform .1s;

  &:hover {
    background: ${props => props.$active ? ACCENT : ACCENT_SOFT};
  }

  &:active {
    transform: scale(.96);
  }
`

export default ({ tenses, tensesWithCategories, toggleSelectedTense }) => (
  <TenseSelectorStyles>
    <div className='tense-selector-title'>Tense / Mood</div>
    {
      tenses && tensesWithCategories && Object.keys(tensesWithCategories).map(category =>
        <div key={category}>
          <div className='tense-category-name'>{category}</div>
          <div className='tense-category-tenses'>
          {
            tensesWithCategories[category]
              .filter(t => t in tenses)
              .map(t => (
                <Tense
                  type='button'
                  key={ t }
                  $active={ tenses[t] }
                  aria-pressed={ !!tenses[t] }
                  onClick={ () => toggleSelectedTense({ ...tenses, [t]: !tenses[t] }) }
                >{ capitalize(t) }</Tense>
              ))
          }
          </div>
        </div>
      )
    }
  </TenseSelectorStyles>
)
