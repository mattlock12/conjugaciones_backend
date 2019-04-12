import React from 'react';
import styled from 'styled-components';


const AppHeader = styled.div`
  display: flex;
  align-items: center;
  padding-left: 50px;

  @media (max-width: 900px) {
    padding-left: 20px;
  }

  .describer {
    padding-left: 30px;
    font-size: 12px;
  }

  .language-selector {
    display: flex;
    margin-left: 20px;

    .language {
      text-decoration: none;
      margin-left: 10px;
      font-size: 20px;
      border-top: 2px solid transparent;
      border-bottom: 2px solid transparent;

      &:hover, &.selected {
        cursor: pointer;
        color: blue;
        border-top: 2px solid blue;
        border-bottom: 2px solid blue;
      }
    }
  }
`

export default ({ language }) => (
  <AppHeader>
    <h1>Entend.ió</h1>
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
    <div className='describer'>Choose tense / mood combos below</div>
  </AppHeader>
)
