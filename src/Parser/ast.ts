export type ASTNode = Program | Statement | Expression

export interface Program { kind: 'program', body: Statement[] }

export type Statement = LetStatement | ReturnStatement | ExpressionStatement | BlockStatement

export interface LetStatement { kind: 'let', name: Identifier, expr: Expression }
export interface ReturnStatement { kind: 'returnStatement', expr: Expression }
export type ExpressionStatement = { kind: "expressionStatement", expr: Expression }
export type BlockStatement = { kind: "blockStatement", statements: Statement[] }

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
export const program = (body : Statement[]) => ({ kind: 'program', body })
export const identifier = (value: string) => ({ kind: 'identifier', value })

export const letStatement = (name: Identifier, expr: Expression) => ({ kind: 'let', name, expr })
export const returnStatement = (expr: Expression) => ({ kind: 'returnStatement', expr })
export const expressionStatement = (expr: Expression) => ({ kind: "expressionStatement", expr })
export const blockStatement = ( statements: Statement[] ) => ({ kind: "blockStatement", statements })

export const unaryExpression = ( operator: string, expr: Expression) => ({  kind: 'unaryExpression', operator, expr })
export const binaryExpression = (operator: string, left: Expression, right: Expression) => ({ kind: 'binaryExpression', operator, left, right })

export const integerLiteral = (value: number) => ({ kind: 'integerLiteral', value })
export const booleanLiteral = (value: boolean) => ({ kind: 'booleanLiteral', value })