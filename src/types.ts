export type ComparisonOperator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with';
export type LogicalOperator = 'and' | 'or';

export interface Condition {
  field: string;
  op: ComparisonOperator;
  value: any;
}

export interface ConditionGroup {
  operator: LogicalOperator;
  conditions: (Condition | ConditionGroup)[];
}

export interface ConditionDefinition {
  operator?: LogicalOperator;
  conditions?: (Condition | ConditionGroup)[];
  'conditions-file'?: string;
  outputs?: Record<string, any>;
}

export type ConditionConfig = Record<string, ConditionDefinition>;

export interface EvaluationResult {
  matched: boolean;
  matchedConditions: string[];
  outputs: Record<string, any>;
}

export interface MatrixOutput {
  include: Array<Record<string, any>>;
}

export interface ActionInputs {
  conditionsFile?: string;
  conditionsJson?: string;
}

export interface ActionOutputs {
  matrix: string;
}