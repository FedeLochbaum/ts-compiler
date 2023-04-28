import { Token, TokenKind } from '../Lexer/token'
import Lexer from '../Lexer/lexer'
import { Precedence, precedenceMap } from './precedence'
import {
  Statement,
  Expression,
  program,
  identifier,
  letStatement,
  returnStatement,
  unaryExpression,
  binaryExpression,
  integerLiteral,
  booleanLiteral,
  expressionStatement,
} from './ast'

const EOF : string = 'eof'
const LET : string = 'let'
const RETURN : string = 'return'
const IDENTIFIER : string = 'identifier'
const ASSIGNER : string = 'assigner'
const SEMICOLON : string = 'semicolon'
const TRUE : string = 'true'

class Parser {
  lexer: Lexer // Instance of the lexer we created above

  token: Token // Current token under examination
  
  peekToken: Token // Next token to be examined

  errors : Array<string>

  prefixParseFunctions = new Map([
    ['minus', this.parseUnaryExpression.bind(this)],
    ['integer', this.parseIntegerLiteral.bind(this)],
    // and many others
  ])

  infixParseFunctions = new Map([
    ['minus', this.parseBinaryExpression.bind(this)],
    ['multiply', this.parseBinaryExpression.bind(this)],
  ])

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.token = lexer.getToken()
    this.peekToken = lexer.getToken()
    this.errors = []
  }

  parse() {
    const statements: Statement[] = []

    while (this.token.kind !== EOF) {
      const statement = this.parseStatement()

      if (statement) statements.push(statement)

      this.nextToken()
    }

    return program(statements)
  }

  parseStatement() {
    if (![LET, RETURN].includes(this.token.kind)) return this.parseExpressionStatement()
    return this.tokenIs(LET) ? this.parseLetStatement() : this.parseReturnStatement()
  }

  parseLetStatement() {
    if (!this.peekTokenIs(IDENTIFIER)) return

    const name = identifier(this.token.text)

    if (!this.peekTokenIs(ASSIGNER)) return

    this.nextToken()

    const expression = this.parseExpression(Precedence.Lowest)

    if (!expression) throw new Error('Expected new expression')

    while (!this.tokenIs(SEMICOLON)) this.nextToken()

    return letStatement(name, expression)
  }

  parseReturnStatement() {
    this.nextToken();

    const expression = this.parseExpression(Precedence.Lowest)

    if (!expression) throw new Error('Expected expression')

    while (!this.tokenIs(SEMICOLON)) this.nextToken()

    return returnStatement(expression)
  }

  parseExpressionStatement() {
    const expression = this.parseExpression(Precedence.Lowest)

    if (!expression) return undefined

    // expression statement is not announced by a keyword
    // so adjust the condition to identify the token range
    while (this.peekTokenIs(SEMICOLON)) this.nextToken()

    return expressionStatement(expression)
  }

  parseUnaryExpression() {
    const operator = this.token.text

    this.nextToken()

    const expr = this.parseExpression(Precedence.Unary)

    if (!expr) return

    return unaryExpression(operator, expr)
  }

  parseBinaryExpression(left: Expression) {
    const operator = this.token.text

    const precedence = this.currentPrecedence()

    this.nextToken()

    const right = this.parseExpression(precedence)

    if (!right) return

    return binaryExpression(operator, left, right)
  }

  parseExpression(precedence: Precedence) {
    // Find the prefix parsing function for the current token kind.
    const prefixParseFn = this.prefixParseFunctions.get(this.token.kind)
    if (!prefixParseFn) { this.errors.push(`No unary parse function for ${this.token.kind}`); return }

    // Call the prefix parsing function to build the expression node.
    let leftExpression = prefixParseFn()

    // Check if the expression continues with a binary operator and,
    // if so, for as many times as needed, find and call the binary
    // parsing function, adding to the current expression node.
    while (!this.peekTokenIs(SEMICOLON) && precedence < this.peekPrecedence()) {
      const peekKind = this.peekToken?.kind

      if (!peekKind) throw new Error('peekKind cannot be null.')

      const infixParseFn = this.infixParseFunctions.get(peekKind)
      if (!infixParseFn) return leftExpression

      this.nextToken()

      if (!leftExpression) throw new Error('Expected to find left expression')
      leftExpression = infixParseFn(leftExpression)
    }

    return leftExpression
  }

  parseIntegerLiteral() {
    const value = Number(this.token.text)

    if (Number.isNaN(value)) { this.errors.push(`could not parse ${this.token.text} as integer`); return undefined }

    return integerLiteral(value)
  }

  parseBooleanLiteral = () => booleanLiteral(this.token.kind === TRUE)

  currentPrecedence = () => precedenceMap.get(this.token.kind) ?? Precedence.Lowest
  peekPrecedence = () => (this.peekToken && precedenceMap.get(this.peekToken.kind)) ?? Precedence.Lowest

  tokenIs = (kind : string) : boolean => this.token.kind === kind
  peekTokenIs = (kind : string) : boolean => this.peekToken.kind === kind

  nextToken() {
    if (!this.peekToken) throw new Error('No more tokens')

    this.token = this.peekToken
    this.peekToken = this.lexer.getToken()
  }
}

export default Parser
