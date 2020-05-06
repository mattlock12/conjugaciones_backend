import React, { useState } from 'react';
import styled from 'styled-components';

import {
FIERY_ROSE,
} from '../constants/StyleConstants';
import TenseSelector from './TenseSelector';


const StyledAppHeader = styled.div`
position: relative;
margin-left: ${props => props.isOpen ? '0px' : '-400px'};
display: flex;
width: 400px;
flex-direction: column;
align-items: flex-start;
background: ${FIERY_ROSE};
padding-left: 50px;
padding-right: 50px;
color: white;

transition: .3s margin-left ease;


.first-row {
 display: flex;
  align-items: center;
}

.open-toggler {
  position: absolute;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  right: 25px;
}

@media (max-width: 900px) {
  padding-left: 20px;
}

.language-selector {
  display: flex;
  margin-left: 20px;
  color: white;

  .language {
    text-decoration: none;
    margin-left: 10px;
    font-size: 20px;
    border-top: 2px solid transparent;
    border-bottom: 2px solid transparent;

    :visited {
      color: white;
    }

    &:hover, &.selected {
      cursor: pointer;
      color: white;
      border-top: 2px solid white;
      border-bottom: 2px solid white;
    }
  }
}
`

const AppHeader = ({
  language,
  tenses,
  tensesWithCategories,
  toggleSelectedTense,
  children,
}) => {
  const [ isOpen, toggleIsOpen ] = useState(true);

  return (
    <StyledAppHeader isOpen={isOpen}>
      <div className='first-row'>
        <h1 id='logo'>Entend.ió</h1>
        <div className='language-selector'>
          <a
            href='/?l=ES'
            className={`language ${language === 'ES'
              ? 'selected'
              : ''}`
            }
          >ES</a>
          <a
            href='/?l=IT'
            className={`language ${language === 'IT'
              ? 'selected'
              : ''}`
            }
          >IT</a>
        </div>
        <div
          className='open-toggler'
          onClick={() => toggleIsOpen(!isOpen)}
        >
        {
          isOpen ? '<<' : '>>'
        }
        </div>
      </div>
      { children }
      <TenseSelector
        language={language}
        tenses={tenses}
        tensesWithCategories={tensesWithCategories}
        toggleSelectedTense={toggleSelectedTense}
      />
      </StyledAppHeader>
  );
}

export default AppHeader;
