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


const customStyles = {
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? '#4cd0ba' : 'white',
    color: state.isSelected ? 'white' : 'black'
  }),
};

// TODO: prop-types
export default ({activeTenses, toggleTense, tenseOptions, moodSuffix=''}) => (
  <div>
    <Select
      value={moodSuffix.length ? 'Subjunctive' : 'Indicative / Imperative'}
      onChange={toggleTense}
      isMulti={true}
      hideSelectedOptions={false}
      styles={customStyles}
      value={ 
        Object.keys(activeTenses)
        .filter(at => activeTenses[at] && tenseOptions.indexOf(at) != -1)
        .map(t => ({ value: t, label: t}))
      }
      placeholder={moodSuffix.length ? 'Subjunctive' : 'Indicative / Imperative'}
      options={tenseOptions.map(to => ({value: to, label: to}))}
    />
  </div>
)