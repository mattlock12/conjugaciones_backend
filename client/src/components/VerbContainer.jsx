import React, { Component } from 'react';

import ConjugationForm from './ConjugationForm';
import TenseHeader from './TenseHeader';

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


export default class VerbContainer extends Component {
  constructor(props) {
    super(props);

    const savedTenses = JSON.parse(localStorage.getItem('tenses')) || {};
    this.state = {
      hasLoaded: false,
      idx: 0,
      tenses: Object.assign(DEFAULT_TENSES, savedTenses),
      verbs: []
    }

    this._loadVerbs = this.loadVerbs.bind(this);
    this._toggleTense = this.toggleTense.bind(this);
    this._nextVerb = this.nextVerb.bind(this);
  }

  loadVerbs() {
    fetch(`http://entend.io/verbs`).then(resp =>
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

  toggleTense(name) {
    this.setState((prevState) => {
      const newState = {
        tenses: {
          ...prevState.tenses,
          [name]: !prevState.tenses[name]
        }
      }
      localStorage.setItem(
        'tenses',
        JSON.stringify(Object.assign(prevState.tenses, newState.tenses))
      );
      return newState;
    });
  }

  submitVerbs(formValues) {
    this.setState({ formValuess });
  }

  render() {
    const { hasLoaded, tenses, verbs, idx } = this.state;
    const verb = verbs[idx];

    return (
      <div style={{ width: '100%' }}>
      <div style={{ display: 'flex' }}>
        <TenseHeader activeTenses={ tenses } toggleTense={ this._toggleTense } />
      </div>
      {
        !hasLoaded ?
        <h1>Loading Some Verbs</h1> :
        <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1>{ verb.infinitive }</h1>
          <p style={{ marginLeft: '20px' }}>({ verb.infinitiveEnglish })</p>
          <p
            style={{
              border: '1px solid gray',
              borderRadius: '8px',
              marginLeft: '20px',
              padding: '7px'
            }}
            onClick={this._nextVerb}
          >next >></p>
        </div>
        <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
          {
            Object.keys(tenses).filter(t => tenses[t]).map(tense => (
              <div
                key={`${tense}${verbs[idx]}`}
                style={{
                  margin: '20px',
                  marginTop: '0px',
                  border: '1px solid #aaa',
                  borderRadius: '8px',
                  padding: '15px'
                }}
              >
              <div
                key={`${tense}tense`}
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '7px'
                }}
              >{tense}</div>
              <ConjugationForm
                conjugations={
                  verbs[idx].conjugations.find(
                    v => v.tense.toLowerCase() == tense.toLowerCase()) || {} 
                }
                key={`${tense}CF`}
                tense={tense}
                verb={verbs[idx]}
              />
              </div>
            ))
          }
          </div>
        </div>
      }
      </div>
    );
  }
}
