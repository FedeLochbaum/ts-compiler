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
  CallExpression,
  Expression
} from "../Parser/ast"
import { Environment } from "./env"
import { Value, booleanValue, fnValue, integerValue, nullValue, returnValue, isError, NULL, isTruthy, error, TRUE, FALSE, integer, boolean, Integer, equals } from "./value"

const evalProgram = ({ body } : Program, environment: Environment): Value => {
  let result: Value = nullValue()

  for (const statement of body) {
    result = evaluate(statement, environment)

    if (result.kind === 'returnValue') { return result.value as Value }
    if (result.kind === 'error') { return result }
  }

  return result
}

const evalExpressionStatement = ({ expr }: ExpressionStatement, environment: Environment): Value => evaluate(expr, environment)

const evalBlockStatement = ({ statements } : BlockStatement, environment: Environment): Value => {
  let result: Value = nullValue()

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
const evalFunctionLiteral = ({ parameters, body } : FunctionLiteral, environment: Environment): Value => fnValue(parameters, body as BlockStatement, environment)
const evalIdentifier = (node : Identifier, environment: Environment): Value => {
  const value = environment.get(node.value)

  return value || error(`identifier not found: ${node.value}`)
}

const evalUnaryExpression = ({ operator, expr } : UnaryExpression, environment: Environment): Value => {
  const right = evaluate(expr, environment)

  if (isError(right)) return right

  return evaluateUnaryExpression(operator, right)
}

const evaluateUnaryExpression = ( operator: string, right: Value ) : Value => {
  if (operator === '!') return evaluateBangOperatorExpression(right)
  if (operator === '-') return evaluateMinusOperatorExpression(right)

  return error(`unknown operator: ${operator}${right.kind}`)
}

const evaluateBangOperatorExpression = ( right: Value ) : Value => {
  if (right.kind === 'boolean') return right.value ? FALSE : TRUE
  if (right.kind === 'null') return TRUE
  
  return FALSE
}

const evaluateMinusOperatorExpression = ( right: Value ) : Value => {
  if (right.kind !== "integer") return error(`unknown operator: -${right.kind}`)

  return integer(-right.value)
}

const evalBinaryExpression = ({ operator, left, right } : BinaryExpression, environment: Environment): Value => {
  const _left = evaluate(left, environment)

  if (isError(_left)) return _left

  const _right = evaluate(right, environment)

  if (isError(_right)) return _right

  return evaluateBinaryExpression(operator, _left, _right)
}

const evaluateBinaryExpression = ( operator: string, left: Value, right: Value ) : Value => {
  if (left.kind !== right.kind) return error(`type mismatch: ${left.kind} ${operator} ${right.kind}`)

  if (operator === '==') return boolean(equals(left, right))
  if (operator === '!=') return boolean(!equals(left, right))

  if (left.kind === "integer" && right.kind === "integer") return evaluateIntegerBinaryExpression(operator, left, right)

  return error(`unknown operator: ${left.kind} ${operator} ${right.kind}`)
}

const func_by_operator = {
  '+': (l : number, r : number) => integer(l + r),
  '-': (l : number, r : number) => integer(l - r),
  '*': (l : number, r : number) => integer(l * r),
  '/': (l : number, r : number) => integer(l / r),
  '<': (l : number, r : number) => boolean(l < r),
  '>': (l : number, r : number) => boolean(l > r)
}

const evaluateIntegerBinaryExpression = ( operator: string, left: Integer, right: Integer ): Value => {
  const func = func_by_operator[operator as keyof typeof func_by_operator]

  return func ? func(left.value, right.value) : error(`unknown operator: ${left.kind} ${operator} ${right.kind}`)
}

const evalIfExpression = ({ condition, consequence, alternative } : IfExpression, environment: Environment): Value => {
  const _condition = evaluate(condition, environment)

  if (isError(_condition)) return _condition

  if (isTruthy(_condition)) return evaluate(consequence, environment)
  
  if (alternative) return evaluate(alternative, environment)

  return NULL
}

const evalCallExpression = ({ func, args } : CallExpression, environment: Environment) : Value => {
  const _func = evaluate(func, environment)

  if (isError(_func)) return _func

  const _args = evaluateExpressions(args, environment)

  if (_args.length == 1 && isError(_args[0])) return _args[0]

  return callFunction(_func, _args)
}

const callFunction = ( func: Value, args: Value[] ) : Value => {
  if (func.kind !== 'fn') return error("not a function: " + func.kind)

  const evaluated = evaluate(func.body, Environment.createFunctionEnv(func, args))

  if (evaluated.kind === 'returnValue') return evaluated.value as Value

  return evaluated
}

const evaluateExpressions = ( expressions: Expression[], environment: Environment ): Value[] => {
  const results: Value[] = []

  for (const expression of expressions) {
    const evaluated = evaluate(expression, environment)
    if (isError(evaluated)) return [evaluated]
    results.push(evaluated)
  }

  return results
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

  return EVAL_BY_KIND[kind as keyof typeof EVAL_BY_KIND](node as any, environment)
}