import { Token, ILLEGAL_TOKEN, TOKEN } from './token'

const EOF : string = '\0'

const isNumber = (_ : string) => /^[0-9]$/.test(_)
const isLetter = (_ : string) => /^[a-zA-Z]$/.test(_)
const isWhitespace = (_ : string) => /^\s$/.test(_)

export class Lexer {

  input = '' // Plaintext provided to the lexer
  
  pos = 0 // Current position
  
  char = '' // Char of current position

  peekPos = 0 // Next position 

  finished = false // Whether the lexer has finished

  token_by_char  = {
    '=': (start : number) => {
      if (this.peekChar() === '=') { this.moveForward(); return TOKEN.EQUAL(start) }

      return TOKEN.ASSIGNER(start)
    },
    '!': (start : number) => {
      if (this.peekChar() === '=') { this.moveForward(); return TOKEN.NOT_EQUAL(start) }

      return TOKEN.BANG(start)
    },
    '+': TOKEN.PLUS,
    '-': TOKEN.MINUS,
    '/': TOKEN.SLASH,
    '*': TOKEN.ASTERISK,
    '<': TOKEN.LESS_THAN,
    '>': TOKEN.GREATER_THAN,
    ';': TOKEN.SEMICOLON,
    ',': TOKEN.COMMA,
    '(': TOKEN.LEFT_PAREN,
    ')': TOKEN.RIGHT_PAREN,
    '{': TOKEN.LEFT_BRACE,
    '}': TOKEN.RIGHT_BRACE,
    '\0': TOKEN.EOF
  }

  constructor(input: string) { this.input = input; this.moveForward() }

  peekChar = () => this.peekPos >= this.input.length ? '\0' : this.input[this.peekPos]

  getToken() : Token {
    while (isWhitespace(this.char)) this.moveForward()

    const token = this.token_by_char[this.char as keyof typeof this.token_by_char] ?
      this.token_by_char[this.char as keyof typeof this.token_by_char](this.pos, this.char) : this.getLongToken()

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

    return TOKEN.INT(start, this.input.substring(start, this.pos))
  }

  getTextToken() : Token {
    const start = this.pos

    while (isLetter(this.char)) this.moveForward()

    const text = this.input.substring(start, this.pos)

    return (TOKEN.KEYWORDS[text as keyof typeof TOKEN.KEYWORDS] || TOKEN.ID)(start, text)
  }

  moveForward() {
    this.char = this.peekPos >= this.input.length ? EOF : this.input[this.peekPos]

    // Move pointers
    this.pos = this.peekPos
    this.peekPos += 1
  }
}

export default Lexer