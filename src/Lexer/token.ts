export interface Token { kind: TokenKind, text: string, start: number }

type keyword   = 'let' | 'function' | 'if' | 'else' | 'return' | 'true' | 'false'
type operator  = 'assigner' | 'plus' | 'minus' | 'bang' | 'slash' | 'lessThan' | 'greaterThan' | 'asterisk' | 'equal' | 'notEqual'
type delimiter = 'comma' | 'semicolon' | 'leftParen' | 'rightParen' | 'leftBrace' | 'rightBrace'
type values    = 'identifier' | 'integer'
type specials  = 'illegal' | 'eof'

export type TokenKind = | keyword | operator | delimiter | values | specials

export const ILLEGAL_TOKEN = (start : number, text : string) : Token => ({ kind: 'illegal', text, start })
export const makeToken = (kind: TokenKind) => (start: number, text : string) : Token => ({ kind, text, start })

const TOKEN_KEYWORD = (text: TokenKind) => (start: number, _ : string) => makeToken(text)(start, text)

export const TOKEN = {
  ASSIGNER: (start: number) => makeToken('assigner')(start, '='),
  BANG: (start: number) => makeToken('bang')(start, '!'),
  PLUS: (start: number) => makeToken('plus')(start, '+'),
  MINUS: (start: number) => makeToken('minus')(start, '-'),
  SLASH: makeToken('slash'),
  ASTERISK: makeToken('asterisk'),
  LESS_THAN: (start: number) => makeToken('lessThan')(start, '<'),
  GREATER_THAN: (start: number) => makeToken('greaterThan')(start, '>'),
  SEMICOLON: makeToken('semicolon'),
  COMMA: (start: number) => makeToken('comma')(start, ','),
  LEFT_PAREN: (start: number) => makeToken('leftParen')(start, '('),
  RIGHT_PAREN: (start: number) => makeToken('rightParen')(start, ')'),
  LEFT_BRACE: (start: number) => makeToken('leftBrace')(start, '{'),
  RIGHT_BRACE: (start: number) => makeToken('rightBrace')(start, '}'),
  EQUAL: (start: number) => makeToken('equal')(start, '=='),
  NOT_EQUAL: (start: number) => makeToken('notEqual')(start, '!='),
  INT: makeToken('integer'),
  ID: makeToken('identifier'),

  LET: TOKEN_KEYWORD('let'),
  FN: (start: number) => makeToken('function')(start, 'fn'),
  IF: TOKEN_KEYWORD('if'),
  ELSE: TOKEN_KEYWORD('else'),
  RET: TOKEN_KEYWORD('return'),
  TRUE: TOKEN_KEYWORD('true'),
  FALSE: TOKEN_KEYWORD('false'),

  KEYWORDS: {
    fn: makeToken('function'),
    let: makeToken('let'),
    true: makeToken('true'),
    false: makeToken('false'),
    if: makeToken('if'),
    else: makeToken('else'),
    return: makeToken('return')
  },

  EOF: makeToken('eof')
}