import { Token, TokenKind } from '../Lexer/token'
import Lexer from '../Lexer/lexer'
import { Precedence, precedenceMap } from './precedence'
import {
  // Types
  UnaryExpression,
  BinaryExpression,
  Identifier,
  Statement,
  Expression,

  // Builders
  program,
  identifier,
  letStatement,
  returnStatement,
  unaryExpression,
  binaryExpression,
  integerLiteral,
  booleanLiteral,
  expressionStatement,
  callExpression,
  functionLiteral,
  ifExpression,
  blockStatement,
} from './ast'

const EOF : string = 'eof'
const LET : string = 'let'
const RETURN : string = 'return'
const IDENTIFIER : string = 'identifier'
const ASSIGNER : string = 'assigner'
const SEMICOLON : string = 'semicolon'
const TRUE : string = 'true'

type MaybeExpr = Expression | undefined
type PrefixParseFn = () => MaybeExpr
type InfixParseFn = (_: Expression) => MaybeExpr

export class Parser {
  lexer: Lexer // Instance of the lexer we created above
  token: Token // Current token under examination
  peekToken: Token // Next token to be examined
  errors : Array<string>
  infixParseFunctions: { [key: string]: InfixParseFn }
  prefixParseFunctions: { [key: string]: PrefixParseFn }

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.token = lexer.getToken()
    this.peekToken = lexer.getToken()
    this.errors = []
    this.infixParseFunctions = {
      plus: this.parseBinaryExpression,
      minus: this.parseBinaryExpression,
      divide: this.parseBinaryExpression,
      multiply: this.parseBinaryExpression,
      equal: this.parseBinaryExpression,
      notEqual: this.parseBinaryExpression,
      lessThan: this.parseBinaryExpression,
      greaterThan: this.parseBinaryExpression,
      leftParen: this.parseCallExpression,
    }

    this.prefixParseFunctions = {
      integer: this.parseIntegerLiteral,
      true: this.parseBooleanLiteral,
      false: this.parseBooleanLiteral,
      function: this.parseFunctionLiteral,
      identifier: this.parseIdentifier,
      minus: this.parseUnaryExpression,
      bang: this.parseUnaryExpression,
      leftParen: this.parseGroupedExpression,
      if: this.parseIfExpression,
    }
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

  parseStatement = () : any => {
    if (![LET, RETURN].includes(this.token.kind)) return this.parseExpressionStatement()
    return this.tokenIs(LET) ? this.parseLetStatement() : this.parseReturnStatement()
  }

  parseLetStatement = () => {
    if (!this.peekTokenIs(IDENTIFIER)) return

    const name = identifier(this.token.text) as Identifier

    if (!this.peekTokenIs(ASSIGNER)) return

    this.nextToken()

    const expression = this.parseExpression(Precedence.Lowest)

    if (!expression) throw new Error('Expected new expression')

    while (!this.tokenIs(SEMICOLON)) this.nextToken()

    return letStatement(name, expression)
  }

  parseReturnStatement = () => {
    this.nextToken()

    const expression = this.parseExpression(Precedence.Lowest)

    if (!expression) throw new Error('Expected expression')

    while (!this.tokenIs(SEMICOLON)) this.nextToken()

    return returnStatement(expression)
  }

  parseExpressionStatement = () => {
    const expression = this.parseExpression(Precedence.Lowest)

    if (!expression) return undefined

    // expression statement is not announced by a keyword
    // so adjust the condition to identify the token range
    while (this.peekTokenIs(SEMICOLON)) this.nextToken()

    return expressionStatement(expression)
  }

  parseUnaryExpression = () : MaybeExpr => {
    const operator = this.token.text

    this.nextToken()

    const expr = this.parseExpression(Precedence.Unary)

    if (!expr) return

    return unaryExpression(operator, expr) as UnaryExpression
  }

  parseBinaryExpression = (left: Expression) : MaybeExpr => {
    const operator = this.token.text

    const precedence = this.currentPrecedence()

    this.nextToken()

    const right = this.parseExpression(precedence)

    if (!right) return

    return binaryExpression(operator, left, right) as BinaryExpression
  }

  parseGroupedExpression = () : MaybeExpr => {

    this.nextToken()

    const expression = this.parseExpression(Precedence.Lowest)

    if (!this.expectPeek('rightParen')) return

    return expression
  }

  parseIfExpression = () : MaybeExpr => {

    if (!this.expectPeek('leftParen')) return

    this.nextToken()

    const condition = this.parseExpression(Precedence.Lowest)

    if (!condition || !this.expectPeek('rightParen') || !this.expectPeek('leftBrace')) return

    const consequence = this.parseBlockStatement()

    if (!this.peekTokenIs('else')) { return ifExpression(condition, consequence) }

    this.nextToken()

    if (!this.expectPeek('leftBrace')) return

    const alternative = this.parseBlockStatement()

    return ifExpression(condition, consequence, alternative)
  }

  parseCallExpression = (left: Expression) : MaybeExpr => {
    const args = this.parseCallArugments()

    if (left.kind === "identifier" || left.kind == "functionLiteral") {
      if (!args) return

      return callExpression(left, args)
    }
  }

  parseCallArugments = () : Expression[] | undefined => {
    const args : Expression[] = []

    if (this.peekTokenIs('rightParen')) { this.nextToken(); return args }

    this.nextToken()

    const arg = this.parseExpression(Precedence.Lowest)

    if (!arg) return
    args.push(arg)

    while (this.peekTokenIs('comma')) {
      this.nextToken(); this.nextToken()
      const arg = this.parseExpression(Precedence.Lowest)
      if (arg) args.push(arg)
    }

    if (!this.peekTokenIs('rightParen')) return

    return args
  }

  parseExpression = (precedence: Precedence) => {
    // Find the prefix parsing function for the current token kind.
    const prefixParseFn = this.prefixParseFunctions[this.token.kind as keyof typeof this.prefixParseFunctions]
    if (!prefixParseFn) { this.errors.push(`No unary parse function for ${this.token.kind}`); return }

    // Call the prefix parsing function to build the expression node.
    let leftExpression = prefixParseFn()

    // Check if the expression continues with a binary operator and,
    // if so, for as many times as needed, find and call the binary
    // parsing function, adding to the current expression node.
    while (!this.peekTokenIs(SEMICOLON) && precedence < this.peekPrecedence()) {
      const peekKind = this.peekToken?.kind

      if (!peekKind) throw new Error('peekKind cannot be null.')

      const infixParseFn = this.infixParseFunctions[peekKind]
      if (!infixParseFn) return leftExpression

      this.nextToken()

      if (!leftExpression) throw new Error('Expected to find left expression')
      leftExpression = infixParseFn(leftExpression)
    }

    return leftExpression
  }

  parseIntegerLiteral = () : MaybeExpr => {
    const value = Number(this.token.text)

    if (Number.isNaN(value)) { this.errors.push(`could not parse ${this.token.text} as integer`); return undefined }

    return integerLiteral(value) as MaybeExpr
  }

  parseIdentifier = () : MaybeExpr => identifier(this.token.text)

  parseFunctionLiteral = () : MaybeExpr => {
    if (!this.peekTokenIs('leftParen')) return

    const parameters = this.parseFunctionParameters()

    if (!parameters) return

    if (!this.peekTokenIs('leftBrace')) return;

    const body = this.parseBlockStatement()

    return functionLiteral(parameters as Identifier[], body)
  }

  parseBlockStatement = () : Statement => {
    const statements : Statement[] = []

    this.nextToken()

    while (!this.tokenIs('rightBrace') && !this.tokenIs('eof')) {
      const statement = this.parseStatement()

      if (statement) statements.push(statement)

      this.nextToken()
    }

    return blockStatement(statements)
  }

  parseFunctionParameters = () => {
    const identifiers: Expression[] = []

    if (this.peekTokenIs('rightParen')) { this.nextToken(); return identifiers }

    this.nextToken()

    identifiers.push(identifier(this.token.text))

    while (this.peekTokenIs('comma')) {
      this.nextToken(); this.nextToken()
      identifiers.push(identifier(this.token.text))
    }

    if (!this.expectPeek('rightParen')) return

    return identifiers
  }

  parseBooleanLiteral = () : MaybeExpr => booleanLiteral(this.token.kind === TRUE) as MaybeExpr

  currentPrecedence = () => precedenceMap.get(this.token.kind) ?? Precedence.Lowest
  peekPrecedence = () => (this.peekToken && precedenceMap.get(this.peekToken.kind)) ?? Precedence.Lowest

  expectPeek = (kind: Token["kind"]) => {
    if (this.peekTokenIs(kind)) { this.nextToken(); return true }

    this.peekError(kind)
    return false
  }

  peekError = (type: TokenKind) => {
    this.errors.push(
      `expected next token to be ${type}, got ${this.peekToken?.kind} instead`
    );
  }

  tokenIs = (kind : string) : boolean => this.token.kind === kind
  peekTokenIs = (kind : string) : boolean => this.peekToken.kind === kind

  nextToken = () => {
    if (!this.peekToken) throw new Error('No more tokens')

    this.token = this.peekToken
    this.peekToken = this.lexer.getToken()
  }
}

export default Parser
