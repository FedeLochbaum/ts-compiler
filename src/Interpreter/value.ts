import { BlockStatement, Identifier } from "../Parser/ast"
import { Environment } from "./env"

export type Value = Integer | Boolean | Null | Error | ReturnValue | Fn

export type Integer = { kind: 'integer', value: number }
export type Boolean = { kind: 'boolean', value: boolean }
export type Null = { kind: 'null' }
export type ReturnValue = { kind: 'returnValue', value: Object }
export type Error = { kind: 'error', value: string }
export type Fn = { kind: 'fn', parameters: Identifier[], body: BlockStatement, env: Environment }

export const nullValue = () : Value => ({ kind: 'null' })
export const returnValue = ( value : Value) : Value => ({ kind: 'returnValue', value })
export const integerValue = ( value : number ) : Value => ({  kind: 'integer', value })
export const booleanValue = ( value : boolean ) : Value => ({ kind: 'boolean', value })
export const fnValue = (parameters : Identifier[], body : BlockStatement, env : Environment) : Value => ({ kind: 'fn', parameters, body, env })
