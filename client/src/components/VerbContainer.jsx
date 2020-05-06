import React, { Component } from 'react';
import styled from 'styled-components';
import { capitalize } from 'lodash';

import ConjugationForm from './ConjugationForm';


const StyledContainer = styled.div`
  background: #f7f7f7;
  padding-left: 25px;
  width: 100%;
  height: 100%;
  overflow: scroll;

  @media (max-width: 900px) {
    padding: 0 20px;
  }
`

const StyledInfinitiveHeader = styled.div`
  background: white;
  display: flex;
  align-items: center;
  margin-left: -25px;
  padding-left: 25px;
  padding-top: 30px;
  margin-bottom: 15px;
  box-shadow: 1px 1px 3px #424242;

  #infinitive-organizer {
    display: flex;
    align-items: center;
    padding: 5px 0;
  }

  #infinitive {
    font-weight: 600;
    font-size: 28px;
  }

  #infinitive-english {
    margin-left: 20px;
  }

  #next-button {
    margin-left: 50px;
    font-size: 17px;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 5px;
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

    #infinitive-english {
      margin-left: 0;
      font-size: .8rem;
    }

    #next-button {
      width: 100px;
      font-size: 28px;
    }
  }
`

const ConjugationFormList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  background: #f7f7f7;
`

const ConjugationFormHolder = styled.div`
  background: white;
  margin: 20px;
  margin-left: 0px;
  margin-top: 0px;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 15px;
  font-size: 1rem;

  @media (max-width: 900px) {
    margin: 5px 0;
    margin-left: 5px;
    font-size: 1rem;
    width: 100%;
  }
`

const ConjugationTense = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 7px;
`

export default class VerbContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      verbs: [],
      idx: 0,
      hasLoaded: false
    }

    this._loadVerbs = this.loadVerbs.bind(this);
    this._nextVerb = this.nextVerb.bind(this);
  }

  loadVerbs() {
    const { language } = this.props;
    const verbsUrl = process.env.NODE_ENV === 'production' ? 'entend.io' : 'localhost';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    // TODO: is this how you handle dumbass fetch promises?
    fetch(`${protocol}://${verbsUrl}/api/verbs?l=${language}`, {redirect: 'follow'}).then(
      resp => resp.json().then(rResp => this.setState({ verbs: rResp, hasLoaded: true })),
      resp => console.log(resp)
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


  submitVerbs(values) {
    this.setState({ formValues: values });
  }

  render() {
    const { language, tenses } = this.props;
    const { hasLoaded, verbs, idx } = this.state;
    const verb = verbs[idx];

    return (
      <StyledContainer>
        {
          !hasLoaded ?
          <h1>Loading Some Verbs</h1> :
          <div>
            <StyledInfinitiveHeader>
              <div id='infinitive-organizer'>
                <div id='infinitive'>{ verb.infinitive.toLowerCase() }</div>
                <div id='infinitive-english'>({ verb.infinitiveEnglish.toLowerCase() })</div>
              </div>
              <div id='next-button' onClick={ this._nextVerb }>next >></div>
            </StyledInfinitiveHeader>
            <ConjugationFormList>
            {
              tenses && Object.keys(tenses).filter(t => tenses[t]).map((tense, tIdx) => (
                (
                  Object.values(
                    verbs[idx].verbConjugations.find(v => v.tense.toLowerCase() === tense.toLowerCase()) || {}
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
                    verbConjugations={
                      verbs[idx].verbConjugations.find(v =>
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
