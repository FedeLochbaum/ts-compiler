import { BlockStatement, Identifier } from "../Parser/ast"
import { Environment } from "./env"

export type Value = Integer | Boolean | Null | Error | ReturnValue | Fn

export type Integer = { kind: 'integer', value: number }
export type Boolean = { kind: 'boolean', value: boolean }
export type Null = { kind: 'null' }
export type ReturnValue = { kind: 'returnValue', value: Object }
export type Error = { kind: 'error', value: string }
export type Fn = { kind: 'fn', parameters: Identifier[], body: BlockStatement, env: Environment }