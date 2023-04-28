import { TokenKind } from "../Lexer/token"

export enum Precedence {
  Lowest = 0,
  Equal = 1, // ==
  LessGreater = 2, // < or >
  SumSub = 3, // + or -
  MultiplyDivide = 4, // * or /
  Unary = 5, // -x or !x
  Call = 6, // (
}

export const precedenceMap = new Map([
  ['equal', Precedence.Equal],
  ['notEqual', Precedence.Equal],
  ['lessThan', Precedence.LessGreater],
  ['greaterThan', Precedence.LessGreater],
  ['plus', Precedence.SumSub],
  ['minus', Precedence.SumSub],
  ['divide', Precedence.MultiplyDivide],
  ['multiply', Precedence.MultiplyDivide],
  ['leftParen', Precedence.Call],
])