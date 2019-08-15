import React from 'react';
import Select from 'react-select';


const customStyles = {
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? '#4cd0ba' : 'white',
    color: state.isSelected ? 'white' : 'black'
  }),
};

// TODO: prop-types
export default ({ activeTenses, toggleTense, tenseOptions }) => (
  <div>
    <Select
      onChange={toggleTense}
      isMulti={true}
      hideSelectedOptions={false}
      styles={customStyles}
      value={
        Object.keys(activeTenses)
        .filter(at => activeTenses[at] && tenseOptions.indexOf(at) != -1)
        .map(t => ({ value: t, label: t}))
      }
      placeholder='Select mood/tense'
      options={tenseOptions.map(to => ({value: to, label: to}))}
    />
  </div>
)