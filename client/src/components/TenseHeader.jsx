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
];


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
                                    <td 
                                        key={ tense }
                                        name={ tense }
                                        onClick={ () => toggleTense(tense) }
                                        style={{
                                            textAlign: 'center',
                                            fontSize:  '12px',
                                            padding: '5px',
                                            borderRadius: '7px',
                                            background: activeTenses[tense] ? '#4cd0ba' :  'white',
                                            color: activeTenses[tense] ? 'white' : 'black'
                                        }}
                                    >{ tense }</td>
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