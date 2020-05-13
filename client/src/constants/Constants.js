// Español
export const PERSON_TO_LABEL_ES = {
  form1s: 'yo',
  form2s: 'tu',
  form3s: 'Ud',
  form1p: 'nos.',
  form2p: 'vos.',
  form3p: 'Uds.'
};


export const DEFAULT_TENSES_ES = {
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

export const TENSES_WITH_CATEGORIES_ES = {
  "Presente": [
    "Presente",
    "Presente - Imperativo",
    "Presente perfecto",
    "Presente - Subjuntivo",
    "Presente perfecto - Subjuntivo"
  ],
  "Imperfecto": [
    "Imperfecto",
    "Imperfecto - Subjuntivo"
  ],
  "Pretérito": [
    "Pretérito",
    "Pretérito anterior"
  ],
  "Condicional": [
    "Condicional",
    "Condicional perfecto"
  ],
  "Futuro": [
    "Futuro",
    "Futuro perfecto",
    "Futuro - Subjuntivo",
    "Futuro perfecto - Subjuntivo"
  ],
  "Pluscuamperfecto": [
    "Pluscuamperfecto",
    "Pluscuamperfecto - Subjuntivo"
  ]
}

// Italiano
export const PERSON_TO_LABEL_IT = {
  form1s: 'io',
  form2s: 'tu',
  form3s: 'lui/lei',
  form1p: 'noi',
  form2p: 'voi',
  form3p: 'loro'
};


export const DEFAULT_TENSES_IT = {
  'PRESENTE': true,
  'IMPERATIVO': false,
  'PASSATO PROSSIMO': true,
  'IMPERFETTO': true,
  'PASSATO REMOTO': false,
  'TRAPASSATO PROSSIMO': false,
  'TRAPASSATO REMOTO': false,
  'FUTURO SEMPLICE': false,
  'FUTURO ANTERIORE': false,
  'PRESENTE CONDIZIONALE': false,
  'PASSATO CONDIZIONALE': false,
  'PRESENTE CONGIUNTIVO': false,
  'PASSATO CONGIUNTIVO': false,
  'IMPERFETTO CONGIUNTIVO': false,
  'TRAPASSATO CONGIUNTIVO': false
};

export const TENSES_WITH_CATEGORIES_IT = {
  'PRESENTE': [
    'PRESENTE',
    'PRESENTE CONDIZIONALE',
    'PRESENTE CONGIUNTIVO',
    'IMPERATIVO'
  ],
  'PASSATO': [
    'PASSATO PROSSIMO',
    'PASSATO CONDIZIONALE',
    'PASSATO CONGIUNTIVO',
    'PASSATO REMOTO'
  ],
  'IMPERFETTO': [
    'IMPERFETTO',
    'IMPERFETTO CONGIUNTIVO'
  ],
  'FUTURO': [
    'FUTURO SEMPLICE',
    'FUTURO ANTERIORE',
  ],
  'TRAPASSATO': [
    'TRAPASSATO PROSSIMO',
    'TRAPASSATO REMOTO',
    'TRAPASSATO CONGIUNTIVO'
  ]
}

export const LANGUAGE_TO_TENSES = {
  ES: DEFAULT_TENSES_ES,
  IT: DEFAULT_TENSES_IT
};

export const TENSES_WITH_CATEGORIES_BY_LANGUAGE = {
  ES: TENSES_WITH_CATEGORIES_ES,
  IT: TENSES_WITH_CATEGORIES_IT
}


export const LANGUAGE_TO_LABELS = {
  ES: PERSON_TO_LABEL_ES,
  IT: PERSON_TO_LABEL_IT
};