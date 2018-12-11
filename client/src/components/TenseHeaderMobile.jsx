import React from 'react';
import Select from 'react-select';


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
        <Select
            value={moodSuffix.length ? 'Subjunctive' : 'Indicative / Imperative'}
            onChange={toggleTense}
            isMulti={true}
            placeholder={moodSuffix.length ? 'Subjunctive' : 'Indicative / Imperative'}
            options={INDICATIVE_TENSES.map(t => ({ value: `${t}${moodSuffix}`, label: `${t}${moodSuffix}` }))}
        />
    </div>
)