import enum


class EnglishMood(enum.Enum):
    IMPERATIVE_AFFIRMATIVE = 'Imperative Affirmative'
    SUBJUNCTIVE = 'Subjunctive'
    IMPERATIVE_NEGATIVE = 'Imperative Negative'
    INDICATIVE = 'Indicative'
    pass


class EnglishTense(enum.Enum):
    # 'Conditional Perfect'
    # 'Conditional'
    # 'Future Perfect'
    # 'Present Perfect'
    # 'Future'
    # 'Past Perfect'
    # 'Preterite'
    # 'Present'
    # 'Imperfect'
    # 'Preterite (Archaic)'
    pass


class SpanishTense(enum.Enum):
    # 'Futuro'
    # 'Pluscuamperfecto'
    # 'Presente perfecto'
    # 'Pretérito'
    # 'Pretérito anterior'
    # 'Imperfecto'
    # 'Condicional'
    # 'Presente'
    # 'Futuro perfecto'
    # 'Condicional perfecto'
    pass


# via https://www.spanishdict.com/guide/the-100-most-common-spanish-verbs
MOST_COMMON = {
    'abrir',
    'llevar',
    'acabar',
    'lograr',
    'aceptar',
    'mantener',
    'alcanzar',
    'mirar',
    'aparecer',
    'morir',
    'ayudar',
    'nacer',
    'buscar',
    'necesitar',
    'caer',
    'ocurrir',
    'cambiar',
    'ofrecer',
    'comenzar',
    'oír',
    'comprender',
    'pagar',
    'conocer',
    'parar',
    'conseguir',
    'parecer',
    'considerar',
    'partir',
    'contar',
    'pasar',
    'convertir',
    'pedir',
    'correr',
    'perder',
    'crear',
    'permitir',
    'creer',
    'poder',
    'cumplir',
    'poner',
    'dar',
    'preguntar',
    'deber',
    'presentar',
    'decir',
    'producir',
    'dejar',
    'quedar',
    'descubrir',
    'querer',
    'dirigir',
    'realizar',
    'empezar',
    'recibir',
    'encontrar',
    'reconocer',
    'entender',
    'recordar',
    'entrar',
    'resultar',
    'escribir',
    'saber',
    'escuchar',
    'sacar',
    'esperar',
    'salir',
    'estar',
    'seguir',
    'estudiar',
    'sentir',
    'existir',
    'ser',
    'explicar',
    'servir',
    'formar',
    'suponer',
    'ganar    ',
    'tener',
    'gustar',
    'terminar',
    'haber    ',
    'tocar',
    'hablar',
    'tomar',
    'hacer',
    'trabajar',
    'intentar',
    'traer',
    'ir',
    'tratar',
    'jugar',
    'utilizar',
    'leer',
    'venir',
    'levantar',
    'ver',
    'llamar',
    'vivir',
    'llegar',
     'volver'
}