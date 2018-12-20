import React from 'react';
import styled from 'styled-components';

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
];

const Tense = styled.td`
  text-align: center;
  font-size:  12px;
  padding: 5px;
  border-radius: 7px;
  background: ${props => props.active ? '#4cd0ba' :  'white'};
  color: ${props => props.active ? 'white' : 'black' };
`


export default ({activeTenses, toggleTense, moodSuffix=''}) => (
  <div>
    <div>{ moodSuffix.length ? 'Subjunctive' : 'Indicative / Imperative' }</div>
    <table>
      <tbody>
        <tr>
          {
            INDICATIVE_TENSES.map((t) => {
              const tense = `${t}${moodSuffix}`
              if (tense in activeTenses) {
                return (
                  <Tense 
                    key={ tense }
                    name={ tense }
                    active={ activeTenses[tense] }
                    onClick={ () => toggleTense(tense) }
                  >{ tense }</Tense>
                );
              } else {
                return (
                  <td>{ ` ` }</td>
                );

              }
            })
          }
        </tr>
      </tbody>
    </table>
  </div>
)
