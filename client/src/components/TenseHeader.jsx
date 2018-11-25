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

export default ({ activeTenses, toggleTense }) => (
    <>
        <table>
            <tbody>
                <tr>
                    <th>Indicative / Imperative</th>
                </tr>
                <tr>
                    
                    {
                        INDICATIVE_TENSES.map(it =>
                            <td 
                                key={ it }
                                name={ it }
                                onClick={ () => toggleTense(it) }
                                style={{ 
                                    textAlign: 'center',
                                    fontSize:  '12px',
                                    borderRadius: '7px',
                                    padding: '5px',
                                    background: activeTenses[it] ? '#4cd0ba' :  'white',
                                    color: activeTenses[it] ? 'white' : 'black'
                                }}
                            >{ it }</td>
                        )
                    }
                </tr>
                <tr>
                    <th>Subjunctive</th>
                </tr>
                <tr>
                    
                {
                        INDICATIVE_TENSES.map(it => `${it} - Subjuntivo`).map(st =>
                            st in activeTenses ?
                                <td 
                                    key={ st }
                                    name={ st }
                                    onClick={ () => toggleTense(st) }
                                    style={{
                                        textAlign: 'center',
                                        fontSize:  '12px',
                                        padding: '5px',
                                        borderRadius: '7px',
                                        background: activeTenses[st] ? '#4cd0ba' :  'white',
                                        color: activeTenses[st] ? 'white' : 'black'
                                    }}
                                >{ st }</td>
                            :
                                <td>{ ` ` }</td>
                        )
                    }
                </tr>
            </tbody>
        </table>
    </>
)



