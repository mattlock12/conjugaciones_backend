import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import styled from 'styled-components';

import ConjugationForm from './ConjugationForm';
import TenseHeader from './TenseHeader';
import TenseHeaderMobile from './TenseHeaderMobile';


const DEFAULT_TENSES = {
    "Presente": true, 
    "Presente - Imperativo": false, 
    "Presente perfecto": false, 
    "Pretérito": true, 
    "Futuro": true,
    "Futuro perfecto": false, 
    "Pluscuamperfecto": false, 
    "Imperfecto": false, 
    "Pretérito anterior": false, 
    "Condicional": false,
    "Condicional perfecto": false, 
    // subjunctive
    "Presente - Subjuntivo": false, 
    "Presente perfecto - Subjuntivo": false, 
    "Futuro - Subjuntivo": false,
    "Futuro perfecto - Subjuntivo": false,
    "Pluscuamperfecto - Subjuntivo": false, 
    "Imperfecto - Subjuntivo": false, 
}

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: scroll;
  padding: 0 50px;
`

const TenseHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledVerbContainer = styled.div`
  display: flex;
  align-items: center;

  #infinitive {
    font-size: 48px;
  }

  #infinitive-english {
    margin-left: 20px;
  }

  #next-button {
    margin-left: 50px;
    font-size: 24px;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 18px;
    width: 150px;
    text-align: center;
  }
`

const ConjugationFormHolder = styled.div`
  width: 80%;
  font-size: 2.25rem;
  margin: 20px;
  margin-top: 0px;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 15px;
`

const ConjugationTense = styled.div`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 7px;
`



export default class VerbContainer extends Component {
    constructor(props) {
        super(props);

        let savedTenses = JSON.parse(localStorage.getItem('tenses'));
        if (savedTenses == undefined) {
            savedTenses = {};
        }
        const tenses = Object.assign(DEFAULT_TENSES, savedTenses);

        this.state = {
            verbs: [],
            idx: 0,
            tenses,
            hasLoaded: false
        }

        this._loadVerbs = this.loadVerbs.bind(this);
        this._toggleTense = this.toggleTense.bind(this);
        this._nextVerb = this.nextVerb.bind(this);
    }

    loadVerbs() {
        fetch(`http://localhost:8000/verbs`).then(resp =>
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
        if (tenseNames instanceof Array) {
          // from the mobile select dropdown
            this.setState((prevState) => {
                const tenses = {};
                Object.keys(prevState.tenses).forEach(t => (tenses[t] = false));
                tenseNames.forEach(t => tenses[t.value] = true);
                const newState = { tenses };
               localStorage.setItem(
                   'tenses',
                   JSON.stringify(tenses)
                );
               return newState;
            });
            
        } else {
            this.setState((prevState) => {
                const newState = {
                    tenses: {
                        ...prevState.tenses,
                        [tenseNames]: !prevState.tenses[tenseNames]
                    }
               }
               localStorage.setItem(
                   'tenses',
                   JSON.stringify(Object.assign(prevState.tenses, newState.tenses))
                );
               return newState;
            });
        }
    }

    submitVerbs(values) {
        this.setState({ formValues: values });
    }

    render() {
        const { hasLoaded, tenses, verbs, idx } = this.state;
        const verb = verbs[idx];

        return (
            <StyledContainer>
                <TenseHeaderContainer>
                    <MediaQuery query="(max-device-width: 900px)">
                        <TenseHeaderMobile 
                            activeTenses={ tenses }
                            title={ 'Tense/Mood'}
                            tenseOptions={ Object.keys(tenses) }
                            toggleTense={ this._toggleTense}
                        />
                    </MediaQuery>
                    <MediaQuery query="(min-device-width: 901px)">
                        <TenseHeader 
                            activeTenses={ tenses }
                            toggleTense={ this._toggleTense}
                        />
                        <TenseHeader 
                            activeTenses={ tenses }
                            moodSuffix={' - Subjuntivo'}
                            toggleTense={ this._toggleTense}
                        />
                    </MediaQuery>
                    
                </TenseHeaderContainer>
                { 
                    !hasLoaded ? 
                    <h1>Loading Some Verbs</h1> : 
                    <div>
                        <StyledVerbContainer>
                            <h1 id='infinitive'>{ verb.infinitive }</h1>
                            <p id='infinitive-english'>({ verb.infinitiveEnglish })</p>
                            <p id='next-button' onClick={ this._nextVerb }>next >></p>
                        </StyledVerbContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {
                            Object.keys(tenses).filter(t => tenses[t]).map((tense, idx) => (
                                <ConjugationFormHolder key={`${tense}${verbs[idx]}`} >
                                    <ConjugationTense key={`${tense}tense`}>{tense}</ConjugationTense>
                                    <ConjugationForm
                                        idx={ idx }
                                        key={ `${tense}CF` }
                                        verb={ verbs[idx] }
                                        tense={ tense }
                                        conjugations={ 
                                          verbs[idx].conjugations.find(v => 
                                            v.tense.toLowerCase() == tense.toLowerCase()
                                          ) || {} 
                                        } 
                                    />
                                </ConjugationFormHolder>
                            ))
                        }
                        </div>
                    </div>
                }
            </StyledContainer>
        );
    }
}
