import React from 'react';

const INDICATIVE_TENSES = [
  "Presente",
  "Presente - Imperativo",
  "Presente perfecto",
  "Pretérito",
  "Futuro",
  "Futuro perfecto",
  "Pluscuamperfecto",
  "Imperfecto",
  "Pretérito anterior",
  "Condicional",
  "Condicional perfecto"
]

export default class TenseHeader extends React.Component {
  render() {
    const { activeTenses, toggleTense } = this.props;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div>
          <div>Indicative / Imperative</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap'
            }}
          >
          {
            INDICATIVE_TENSES.map(it =>
            <div
              key={it}
              name={it}
              onClick={() => toggleTense(it)}
              style={{
                background: activeTenses[it] ? '#4cd0ba' :  'white',
                borderRadius: '7px',
                color: activeTenses[it] ? 'white' : 'black',
                cursor: 'pointer',
                fontSize:  '12px',
                padding: '5px',
                textAlign: 'center'
              }}
            >
              {it}
            </div>
            )
          }
          </div>
        </div>
        <div>
          <div>Subjunctive</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap'
            }}
          >
          {
            INDICATIVE_TENSES.map(it => `${it} - Subjuntivo`).map(st =>
            st in activeTenses ?
              <div
                key={st}
                name={st}
                onClick={() => toggleTense(st)}
                style={{
                  background: activeTenses[st] ? '#4cd0ba' :  'white',
                  borderRadius: '7px',
                  color: activeTenses[st] ? 'white' : 'black',
                  cursor: 'pointer',
                  fontSize:  '12px',
                  padding: '5px',
                  textAlign: 'center'
                }}
              >
              {st}
              </div>
            :
              <div key={ st }>{` `}</div>
            )
          }
          </div>
        </div>
      </div>
    )
  }
}
