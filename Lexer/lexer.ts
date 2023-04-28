import { Token, KEYWORDS, ILLEGAL_TOKEN, makeToken, TokenKind } from './token'

const EOF : string = '\0'
const ID : TokenKind = 'identifier'
const INT : TokenKind = 'integer'

const isNumber = /^[0-9]$/.test
const isLetter = /^[a-zA-Z]$/.test
const isWhitespace = /^\s$/.test

class Lexer {

  input = '' // Plaintext provided to the lexer
  
  pos = 0 // Current position
  
  char = '' // Char of current position

  peekPos = 0 // Next position 

  finished = false // Whether the lexer has finished

  token_by_char = {
    '=': (start : number, text : string) => {
      if (this.peekChar() === '=') { this.moveForward(); return makeToken('equal')(start, text) }

      return makeToken('assigner')(start, text)
    },
    '!': (start : number, text : string) => {
      if (this.peekChar() === '=') { this.moveForward(); return makeToken('notEqual')(start, text) }

      return makeToken('bang')(start, text)
    },
    '+': makeToken('plus'),
    '-': makeToken('minus'),
    '/': makeToken('slash'),
    '*': makeToken('asterisk'),
    '<': makeToken('lessThan'),
    '>': makeToken('greaterThan'),
    ';': makeToken('semicolon'),
    ',': makeToken('comma'),
    '(': makeToken('leftParen'),
    ')': makeToken('rightParen'),
    '{': makeToken('leftBrace'),
    '}': makeToken('rightBrace'),
    '\0': makeToken('eof')
  }

  constructor(input: string) {
    this.input = input
    this.moveForward()
  }

  peekChar = () => this.peekPos >= this.input.length ? '\0' : this.input[this.peekPos]

  getToken() : Token {
    while (isWhitespace(this.char)) this.moveForward()

    const token: Token = this.token_by_char[this.char] ? this.token_by_char[this.char](this.pos, this.char) : this.getLongToken()

    // Move to next char and advance both pointers
    this.moveForward()

    return token
  }

  getLongToken() : Token {
    if (isLetter(this.char)) return this.getTextToken()

    if (isNumber(this.char)) return this.getNumToken()

    return ILLEGAL_TOKEN(this.pos, this.char)
  }

  getNumToken() : Token {
    const start = this.pos

    while (isNumber(this.char)) this.moveForward()

    return makeToken(INT)(start, this.input.substring(start, this.pos))
  }

  getTextToken() : Token {
    const start = this.pos

    while (isLetter(this.char)) this.moveForward()

    const text = this.input.substring(start, this.pos)

    return makeToken(KEYWORDS[text] || ID)(start, text)
  }

  moveForward() {
    this.char = this.peekPos >= this.input.length ? EOF : this.input[this.peekPos]

    // Move pointers
    this.pos = this.peekPos
    this.peekPos += 1
  }
}

export default Lexer