import {
  Condition,
  ConditionGroup,
  ComparisonOperator,
  EvaluationResult,
  ConditionConfig,
  ConditionDefinition
} from './types';

export class ConditionEvaluator {
  private context: Record<string, any>;

  constructor(context: Record<string, any>) {
    this.context = context;
  }

  evaluate(config: ConditionConfig): EvaluationResult {
    const matchedConditions: string[] = [];
    let combinedOutputs: Record<string, any> = {};
    let hasMatch = false;

    for (const [name, definition] of Object.entries(config)) {
      const result = this.evaluateDefinition(name, definition);
      if (result.matched) {
        hasMatch = true;
        matchedConditions.push(...result.matchedConditions);
        combinedOutputs = { ...combinedOutputs, ...result.outputs };
      }
    }

    return {
      matched: hasMatch,
      matchedConditions,
      outputs: combinedOutputs
    };
  }

  private evaluateDefinition(name: string, definition: ConditionDefinition): EvaluationResult {
    if (!definition.conditions && !definition['conditions-file']) {
      throw new Error(`Condition "${name}" must have either 'conditions' or 'conditions-file'`);
    }

    const operator = definition.operator || 'and';
    const conditions = definition.conditions || [];
    const outputs = definition.outputs || {};

    if (conditions.length === 0) {
      return {
        matched: true,
        matchedConditions: [name],
        outputs
      };
    }

    const matched = this.evaluateConditionGroup({
      operator,
      conditions
    });

    return {
      matched,
      matchedConditions: matched ? [name] : [],
      outputs: matched ? outputs : {}
    };
  }

  private evaluateConditionGroup(group: ConditionGroup): boolean {
    const { operator, conditions } = group;

    if (conditions.length === 0) {
      return true;
    }

    const results = conditions.map(condition => {
      if (this.isConditionGroup(condition)) {
        return this.evaluateConditionGroup(condition);
      } else {
        return this.evaluateCondition(condition as Condition);
      }
    });

    if (operator === 'and') {
      return results.every(result => result);
    } else {
      return results.some(result => result);
    }
  }

  private evaluateCondition(condition: Condition): boolean {
    const { field, op, value } = condition;
    const fieldValue = this.getFieldValue(field);

    return this.compareValues(fieldValue, op, value);
  }

  private getFieldValue(field: string): any {
    const parts = field.split('.');
    let value: any = this.context;

    for (const part of parts) {
      if (value == null) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  private compareValues(fieldValue: any, op: ComparisonOperator, compareValue: any): boolean {
    switch (op) {
      case '=':
        return fieldValue == compareValue;
      case '!=':
        return fieldValue != compareValue;
      case '>':
        return Number(fieldValue) > Number(compareValue);
      case '>=':
        return Number(fieldValue) >= Number(compareValue);
      case '<':
        return Number(fieldValue) < Number(compareValue);
      case '<=':
        return Number(fieldValue) <= Number(compareValue);
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(compareValue);
        }
        if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
          return fieldValue.toLowerCase().includes(compareValue.toLowerCase());
        }
        return false;
      case 'not_contains':
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(compareValue);
        }
        if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
          return !fieldValue.toLowerCase().includes(compareValue.toLowerCase());
        }
        return true;
      case 'starts_with':
        if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
          return fieldValue.toLowerCase().startsWith(compareValue.toLowerCase());
        }
        return false;
      case 'ends_with':
        if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
          return fieldValue.toLowerCase().endsWith(compareValue.toLowerCase());
        }
        return false;
      default:
        throw new Error(`Unknown operator: ${op}`);
    }
  }

  private isConditionGroup(obj: any): obj is ConditionGroup {
    return obj && typeof obj === 'object' && 'operator' in obj && 'conditions' in obj;
  }
}