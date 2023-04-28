export interface Program { kind: 'program', body: Statement[] }

export type ASTNode = Program | Statement | Expression

export type Statement = LetStatement | ReturnStatement

export interface LetStatement { kind: 'let', name: Identifier, expr: Expression }
export interface ReturnStatement { kind: 'returnStatement', expr: Expression }

export type Expression = Identifier | IntegerLiteral | BooleanLiteral |
  FunctionLiteral | UnaryExpression | BinaryExpression | IfExpression | CallExpression

export interface Identifier { kind: 'identifier', value: string }
export interface IntegerLiteral { kind: 'integerLiteral', value: number }
export interface BooleanLiteral { kind: 'booleanLiteral', value: boolean }
export interface FunctionLiteral { kind: 'functionLiteral', parameters: Identifier[], body: Statement }
export interface UnaryExpression { kind: 'unaryExpression', operator: string, expr: Expression }
export interface BinaryExpression { kind: 'binaryExpression', operator: string, left: Expression, right: Expression }
export interface CallExpression { kind: 'callExpression', func: Identifier | FunctionLiteral, args: Expression[] }
export interface IfExpression { kind: 'ifExpression', condition: Expression, consequence: Statement, alternative?: Statement }

// builders
export const program = body => ({ kind: 'program', body })
export const identifier = value => ({ kind: 'identifier', value })

export const letStatement = (name, expr) => ({ kind: 'let', name, expr })
export const returnStatement = expr => ({ kind: 'returnStatement', expr })
// export const expressionStatement = 

export const unaryExpression = (operator, expr) => ({  kind: 'unaryExpression', operator, expr })
export const binaryExpression = (operator, left, right) => ({ kind: 'binaryExpression', operator, left, right })

export const integerLiteral = value => ({ kind: 'integerLiteral', value })
export const booleanLiteral = value => ({ kind: 'booleanLiteral', value })