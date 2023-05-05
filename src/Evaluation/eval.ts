import {
  ASTNode,
  ExpressionStatement,
  Program,
  BlockStatement,
  LetStatement,
  ReturnStatement,
  IntegerLiteral,
  BooleanLiteral,
  FunctionLiteral,
  Identifier,
  UnaryExpression,
  BinaryExpression,
  IfExpression,
  CallExpression
} from "../Parser/ast"
import { Environment } from "./env"
import { Value } from "./value"

const evalProgram = ({ body }: Program, environment: Environment): Value => {
  let result: Value

  for (const statement of body) {
    result = evaluate(statement, environment)

    if (result.kind === 'returnValue') { return result.value }
    if (result.kind === 'error') { return result }
  }

  return result
}

const evalExpressionStatement = ({ expr }: ExpressionStatement, environment: Environment): Value => evaluate(expr, environment)

const evalBlockStatement = ({ statements } : BlockStatement, environment: Environment): Value => {
  let result: Value

  for (const statement of statements) {
    result = evaluate(statement, environment)

    if (result.kind === 'returnValue' || result.kind === 'error') { return result }
  }

  return result
}

const evalLetStatement = ({ name, expr } : LetStatement, environment: Environment): Value => {
  const valueV = evaluate(expr, environment)

  if (isError(valueV)) return valueV

  environment.set(name.value, valueV)

  return valueV
}

const evalReturnStatement = ({ expr } : ReturnStatement, environment: Environment): Value => {
  const value = evaluate(expr, environment)

  if (isError(value)) return value

  return returnValue(value)
}

const evalIntegerLiteral = ({ value } : IntegerLiteral, environment: Environment): Value => integerValue(value)
const evalBooleanLiteral = ({ value } : BooleanLiteral, environment: Environment): Value => booleanValue(value)
const evalFunctionLiteral = ({ parameters, body} : FunctionLiteral, environment: Environment): Value => fnValue(parameters, body, environment)
const evalIdentifier = (node : Identifier, environment: Environment): Value => evaluateIdentifier(node, environment)

const evalUnaryExpression = ({ operator, expr } : UnaryExpression, environment: Environment): Value => {
  const right = evaluate(expr, environment)

  if (isError(right)) return right

  return evaluateUnaryExpression(operator, right)
}

const evalBinaryExpression = ({ operator, left, right } : BinaryExpression, environment: Environment): Value => {
  const _left = evaluate(left, environment)

  if (isError(_left)) return _left

  const _right = evaluate(right, environment)

  if (isError(_right)) return _right

  return evaluateBinaryExpression(operator, _left, _right)
}

const evalIfExpression = ({ condition, consequence, alternative } : IfExpression, environment: Environment): Value => {

}

const evalCallExpression = ({ func, args } : CallExpression, environment: Environment): Value => {
  const _func = evaluate(func, environment)

  if (isError(_func)) return _func

  const _args = evaluateExpressions(args, environment)

  if (_args.length == 1 && isError(_args[0])) return _args[0]

  return callFunction(_func, _args)
}

export const EVAL_BY_KIND = {
  program: evalProgram,
  blockStatement: evalBlockStatement,
  expressionStatement: evalExpressionStatement,
  letStatement: evalLetStatement,
  returnStatement: evalReturnStatement,
  integerLiteral: evalIntegerLiteral,
  booleanLiteral: evalBooleanLiteral,
  functionLiteral: evalFunctionLiteral,
  identifier: evalIdentifier,
  unaryExpression: evalUnaryExpression,
  binaryExpression: evalBinaryExpression,
  ifExpression: evalIfExpression,
  callExpression: evalCallExpression,
}

export const evaluate = (node: ASTNode, environment: Environment): Value => {
  const { kind } = node

  if (!EVAL_BY_KIND[kind as keyof typeof EVAL_BY_KIND]) throw new Error(`unexpected node: '${node}'`)

  return EVAL_BY_KIND[kind as keyof typeof EVAL_BY_KIND](node, environment)
}