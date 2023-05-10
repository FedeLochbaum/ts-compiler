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
export const fnValue = ( parameters : Identifier[], body : BlockStatement, env : Environment ) : Value => ({ kind: 'fn', parameters, body, env })
export const error = ( value: string ): Error => ({ kind: "error", value })

export const isError = (value: { kind: string }): value is Error => value.kind === "error"
export function isTruthy(val: Value) {
  if (val.kind === 'null') return false

  if (val.kind === 'boolean') return val.value

  if (val.kind === 'integer') return true

  return false
}

// Constant values
export const TRUE : Boolean = { kind: "boolean", value: true }
export const FALSE : Boolean = { kind: "boolean", value: false }
export const NULL : Null = { kind: "null" }

export const integer = ( value: number ): Integer => ({ kind: "integer", value })
export const boolean = ( value: boolean ): Boolean => (value ? TRUE : FALSE)
export const equals = ( a: Value, b: Value ) => {
  if (a.kind === "null" && b.kind === "null") return true

  if (a.kind === "null" || b.kind === "null") return false

  if (a.kind === "fn" || b.kind === "fn") return false

  return a.value === b.value
}