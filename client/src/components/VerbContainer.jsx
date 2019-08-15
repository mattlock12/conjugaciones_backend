import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import styled from 'styled-components';
import { capitalize } from 'lodash';

import ConjugationForm from './ConjugationForm';
import TenseHeader from './TenseHeader';
import TenseHeaderMobile from './TenseHeaderMobile';

import { LANGUAGE_TO_TENSES } from '../constants/Constants';


const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: scroll;
  padding: 0 50px;

  @media (max-width: 900px) {
    padding: 0 20px;
  }
`

const TenseHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledVerbContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;

  #infinitive-organizer {
    display: flex;
    align-items: center;
    padding: 5px 0;
  }

  #infinitive {
    font-weight: 600;
    font-size: 36px;
  }

  #infinitive-english {
    margin-left: 20px;
  }

  #next-button {
    margin-left: 50px;
    font-size: 24px;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 8px;
    width: 150px;
    text-align: center;

    &:hover {
      cursor: pointer;
      background: blue;
      color: white;
      border: white;
    }
  }

  @media (max-width: 900px) {
    #infinitive-organizer {
      flex-direction: column;
      align-items: flex-start;
    }

    #infinitive {
      font-size: 28px;
    }

    #infinitive-english {
      margin-left: 0;
      font-size: .8rem;
    }

    #next-button {
      width: 100px;
    }
  }
`

const ConjugationFormList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`

const ConjugationFormHolder = styled.div`
  margin: 20px;
  margin-top: 0px;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 15px;
  font-size: 1rem;

  @media (max-width: 900px) {
    margin: 0;
    font-size: 1rem;
    width: 100%;
  }
`

const ConjugationTense = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 7px;
`

export default class VerbContainer extends Component {
  constructor(props) {
    super(props);

    const { language } = this.props;
    const savedActiveTenses = JSON.parse(localStorage.getItem(`activeTenses__${language}`)) || {};
    const defaultTenses = LANGUAGE_TO_TENSES[language];

    this.state = {
      verbs: [],
      idx: 0,
      activeTenses: Object.assign(defaultTenses, savedActiveTenses),
      hasLoaded: false
    }

    this._loadVerbs = this.loadVerbs.bind(this);
    this._toggleTense = this.toggleTense.bind(this);
    this._nextVerb = this.nextVerb.bind(this);
  }

  loadVerbs() {
    const { language } = this.props;
    const verbsUrl = process.env.NODE_ENV === 'production' ? 'entend.io' : 'localhost';
    const scheme = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    fetch(`${scheme}://${verbsUrl}/api/verbs?l=${language}`, {redirect: 'follow'}).then(resp =>
      resp.json().then(rResp =>
        this.setState({ verbs: rResp, hasLoaded: true }))
    );
  }

  componentDidMount() {
    this._loadVerbs();
  }

  nextVerb() {
    if (this.state.idx >= this.state.verbs.length - 1) {
      this.setState({ idx: 0, hasLoaded: false, verbs: [] });
      this.loadVerbs()
    } else {
      this.setState({ idx: this.state.idx + 1 });
    }
  }

  toggleTense(tenseNames) {
    const { language } = this.props;

    if (tenseNames instanceof Array) {
      // from the mobile select dropdown
      this.setState((prevState) => {
        const activeTenses = {};
        Object.keys(prevState.activeTenses).forEach(t => (activeTenses[t] = false));
        tenseNames.forEach(t => activeTenses[t.value] = true);
        const newState = { activeTenses };
         localStorage.setItem(
           `activeTenses__${language}`,
           JSON.stringify(activeTenses)
        );
         return newState;
      });

    } else {
      this.setState((prevState) => {
        const newState = {
          activeTenses: {
            ...prevState.activeTenses,
            [tenseNames]: !prevState.activeTenses[tenseNames]
          }
         }
         localStorage.setItem(
           `activeTenses__${language}`,
           JSON.stringify({...prevState.activeTenses, ...newState.activeTenses})
        );
         return newState;
      });
    }
  }

  submitVerbs(values) {
    this.setState({ formValues: values });
  }

  render() {
    const { language } = this.props;
    const { hasLoaded, activeTenses, verbs, idx } = this.state;
    const verb = verbs[idx];

    return (
      <StyledContainer>
        <TenseHeaderContainer>
          <MediaQuery query="(max-device-width: 900px)">
            <TenseHeaderMobile
              activeTenses={ activeTenses }
              tenseOptions={ Object.keys(activeTenses) }
              toggleTense={ this._toggleTense}
            />
          </MediaQuery>
          <MediaQuery query="(min-device-width: 901px)">
            <TenseHeader
              activeTenses={ activeTenses }
              toggleTense={ this._toggleTense}
            />
          </MediaQuery>

        </TenseHeaderContainer>
        {
          !hasLoaded ?
          <h1>Loading Some Verbs</h1> :
          <div>
            <StyledVerbContainer>
              <div id='infinitive-organizer'>
                <div id='infinitive'>{ verb.infinitive.toLowerCase() }</div>
                <div id='infinitive-english'>({ verb.infinitiveEnglish.toLowerCase() })</div>
              </div>
              <div id='next-button' onClick={ this._nextVerb }>next >></div>
            </StyledVerbContainer>
            <ConjugationFormList>
            {
              Object.keys(activeTenses).filter(t => activeTenses[t]).map((tense, tIdx) => (
                (
                  Object.values(
                    verbs[idx].conjugations.find(v => v.tense.toLowerCase() === tense.toLowerCase()) || {}
                  ).some(v => v)
                ) &&
                <ConjugationFormHolder key={`${tense}${verbs[idx]}`} >
                  <ConjugationTense key={`${tense}tense`}>{capitalize(tense)}</ConjugationTense>
                  <ConjugationForm
                    idx={ tIdx }
                    key={ `${tense}CF` }
                    verb={ verbs[idx] }
                    tense={ tense }
                    language={language}
                    conjugations={
                      verbs[idx].conjugations.find(v =>
                        v.tense.toLowerCase() === tense.toLowerCase()
                      ) || {}
                    }
                  />
                </ConjugationFormHolder>
              ))
            }
            </ConjugationFormList>
          </div>
        }
      </StyledContainer>
    );
  }
}
