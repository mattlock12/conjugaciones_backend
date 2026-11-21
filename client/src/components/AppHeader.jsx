import React from 'react';
import styled from 'styled-components';

import {
  CONTROL_TRACK,
  ACCENT_TEXT,
  EASE_IOS,
  LABEL,
  SUCCESS_TEXT,
  SECONDARY_LABEL,
  SEPARATOR,
  SIDEBAR_BG,
  SURFACE,
} from '../constants/StyleConstants';
import { SidebarIcon } from './Icons';
import TenseSelector from './TenseSelector';

export const SIDEBAR_WIDTH = 248;

const Sidebar = styled.aside`
  flex: 0 0 auto;
  width: ${SIDEBAR_WIDTH}px;
  height: 100%;
  margin-left: ${props => props.$isOpen ? 0 : -SIDEBAR_WIDTH}px;
  display: flex;
  flex-direction: column;
  background: ${SIDEBAR_BG};
  border-right: 0.5px solid ${SEPARATOR};
  color: ${LABEL};
  overflow: hidden;
  z-index: 20;
  transition: margin-left .35s ${EASE_IOS}, transform .35s ${EASE_IOS};

  @media (max-width: 900px) {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(290px, 85vw);
    margin-left: 0;
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    box-shadow: ${props => props.$isOpen ? '0 0 40px rgba(0, 0, 0, 0.18)' : 'none'};
  }
`

const Scrim = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 15;
    background: rgba(0, 0, 0, 0.25);
    opacity: ${props => props.$isOpen ? 1 : 0};
    pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
    transition: opacity .35s ${EASE_IOS};
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 10px 16px;
`

const Logo = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${ACCENT_TEXT};

  span {
    color: ${SUCCESS_TEXT};
  }
`

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${ACCENT_TEXT};
  cursor: pointer;

  &:hover {
    background: ${CONTROL_TRACK};
  }
`

const SegmentedControl = styled.nav`
  display: flex;
  margin: 0 16px 12px;
  padding: 2px;
  border-radius: 9px;
  background: ${CONTROL_TRACK};

  a {
    flex: 1;
    padding: 4px 0;
    border-radius: 7px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: ${SECONDARY_LABEL};
    text-decoration: none;
    transition: background .2s, color .2s;

    &:hover {
      color: ${LABEL};
    }

    &.selected {
      background: ${SURFACE};
      color: ${ACCENT_TEXT};
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.10), 0 1px 1px rgba(0, 0, 0, 0.04);
    }
  }
`

const LANGUAGES = ['ES', 'IT'];

const AppHeader = ({
  language,
  tenses,
  tensesWithCategories,
  toggleSelectedTense,
  isOpen,
  setIsOpen,
  children,
}) => (
  <>
    <Scrim $isOpen={isOpen} onClick={() => setIsOpen(false)} />
    <Sidebar $isOpen={isOpen} aria-hidden={!isOpen}>
      <TopRow>
        <Logo>Entend<span>.ió</span></Logo>
        <IconButton
          type='button'
          aria-label='Hide sidebar'
          onClick={() => setIsOpen(false)}
        >
          <SidebarIcon />
        </IconButton>
      </TopRow>
      <SegmentedControl aria-label='Language'>
        {LANGUAGES.map(l => (
          <a
            key={l}
            href={`/?l=${l}`}
            className={language === l ? 'selected' : ''}
          >{l}</a>
        ))}
      </SegmentedControl>
      { children }
      <TenseSelector
        language={language}
        tenses={tenses}
        tensesWithCategories={tensesWithCategories}
        toggleSelectedTense={toggleSelectedTense}
      />
    </Sidebar>
  </>
);

export default AppHeader;
