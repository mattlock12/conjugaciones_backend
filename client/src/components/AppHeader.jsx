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

transition: .3s ease;

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

@media (max-width: 900px) {
  width: auto;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 100px;

  transform: translateX(${props => props.isOpen ? 0 : '-309px'});

  padding-left: 20px;
}
`

const MobileOpener = styled.div`
display: none;

@media (max-width: 900px) {
  color: white;
  position: absolute;
  display: ${props => props.isOpen ? 'none' : 'block'};
  background: ${FIERY_ROSE};
  height: 29px;
  width: 35px;
  left: 5px;
  top: 8px;
  text-align: center;
  border-radius: 100px;
  padding-top: 5px;
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
    <>
    <MobileOpener
      isOpen={isOpen}
      onClick={() => toggleIsOpen(true)}
    >{language}</MobileOpener>
    <StyledAppHeader isOpen={isOpen}>
      <div className='first-row'>
        <h1 id='logo'>Entend.ió</h1>
        <div className='language-selector'>
          <a
            key='es'
            href='/?l=ES'
            className={`language ${language === 'ES'
              ? 'selected'
              : ''}`
            }
          >ES</a>
          <a
            key='it'
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
      </>
  );
}

export default AppHeader;
