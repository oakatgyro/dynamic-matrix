export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

export type ComparisonOperator =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
export type LogicalOperator = 'and' | 'or'

export interface Condition {
  field: string
  op: ComparisonOperator
  value: JsonValue
}

export interface ConditionGroup {
  operator: LogicalOperator
  conditions: (Condition | ConditionGroup)[]
}

export interface ConditionDefinition {
  operator?: LogicalOperator
  conditions?: (Condition | ConditionGroup)[]
  'conditions-file'?: string
  outputs?: JsonObject
}

export type ConditionConfig = Record<string, ConditionDefinition>

export interface EvaluationResult {
  matched: boolean
  matchedConditions: string[]
  outputs: JsonObject
}

export interface MatrixOutput {
  include: JsonObject[]
}

export interface ActionInputs {
  conditionsFile?: string
  conditionsJson?: string
}

export interface ActionOutputs {
  matrix: string
}
