export interface Token { kind: TokenKind, text: string, start: number }

type keyword   = 'let' | 'function' | 'if' | 'else' | 'return' | 'true' | 'false'
type operator  = 'assigner' | 'plus' | 'minus' | 'bang' | 'slash' | 'lessThan' | 'greaterThan' | 'asterisk' | 'equal' | 'notEqual'
type delimiter = 'comma' | 'semicolon' | 'leftParen' | 'rightParen' | 'leftBrace' | 'rightBrace'
type values    = 'identifier' | 'integer'
type specials  = 'illegal' | 'eof'

export type TokenKind = | keyword | operator | delimiter | values | specials

export const KEYWORDS: { [key: string]: TokenKind } = {
  fn: 'function',
  let: 'let',
  true: 'true',
  false: 'false',
  if: 'if',
  else: 'else',
  return: 'return',
}

export const ILLEGAL_TOKEN = (start : number, text : string) : Token => ({ kind: 'illegal', text, start })
export const makeToken = (kind: TokenKind) => (start: number, text : string) : Token => ({ kind, text, start })