import { ConditionEvaluator } from '../src/evaluator';
import { ConditionConfig } from '../src/types';

describe('ConditionEvaluator', () => {
  describe('Basic comparisons', () => {
    test('should evaluate equality', () => {
      const context = { x: 'y', z: 'value' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'x', op: '=', value: 'y' }
          ],
          outputs: { result: 'matched' }
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
      expect(result.outputs).toEqual({ result: 'matched' });
    });

    test('should evaluate inequality', () => {
      const context = { x: 'y' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'x', op: '!=', value: 'z' }
          ]
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
    });

    test('should evaluate numeric comparisons', () => {
      const context = { count: 10 };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'count', op: '>=', value: 5 },
            { field: 'count', op: '<', value: 20 }
          ]
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
    });
  });

  describe('String operations', () => {
    test('should evaluate contains', () => {
      const context = { branch: 'feature/new-feature' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'branch', op: 'contains', value: 'feature' }
          ]
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
    });

    test('should evaluate not_contains', () => {
      const context = { branch: 'main' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'branch', op: 'not_contains', value: 'feature' }
          ]
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
    });

    test('should evaluate starts_with', () => {
      const context = { branch: 'release/v1.0' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'branch', op: 'starts_with', value: 'release' }
          ]
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
    });
  });

  describe('Logical operators', () => {
    test('should evaluate AND operator', () => {
      const context = { x: 'y', z: 'value' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'x', op: '=', value: 'y' },
            { field: 'z', op: '=', value: 'value' }
          ],
          outputs: { env: 'test' }
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
      expect(result.outputs).toEqual({ env: 'test' });
    });

    test('should evaluate OR operator', () => {
      const context = { x: 'y' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'or',
          conditions: [
            { field: 'x', op: '=', value: 'wrong' },
            { field: 'x', op: '=', value: 'y' }
          ],
          outputs: { env: 'test' }
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
    });

    test('should handle nested conditions', () => {
      const context = { branch: 'main', event: 'push' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'or',
          conditions: [
            {
              operator: 'and',
              conditions: [
                { field: 'branch', op: '=', value: 'main' },
                { field: 'event', op: '=', value: 'push' }
              ]
            },
            {
              operator: 'and',
              conditions: [
                { field: 'branch', op: '=', value: 'develop' },
                { field: 'event', op: '=', value: 'pull_request' }
              ]
            }
          ],
          outputs: { deploy: true }
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
      expect(result.outputs).toEqual({ deploy: true });
    });
  });

  describe('Array handling', () => {
    test('should handle array contains', () => {
      const context = { labels: ['bug', 'urgent', 'p1'] };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'labels', op: 'contains', value: 'bug' }
          ]
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
    });
  });

  describe('Multiple configurations', () => {
    test('should evaluate multiple configurations', () => {
      const context = { env: 'dev' };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'dev-config': {
          operator: 'and',
          conditions: [
            { field: 'env', op: '=', value: 'dev' }
          ],
          outputs: { account: '123456' }
        },
        'prod-config': {
          operator: 'and',
          conditions: [
            { field: 'env', op: '=', value: 'prod' }
          ],
          outputs: { account: '789012' }
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
      expect(result.matchedConditions).toContain('dev-config');
      expect(result.outputs).toEqual({ account: '123456' });
    });
  });

  describe('Nested field access', () => {
    test('should access nested fields', () => {
      const context = {
        github: {
          event: {
            pull_request: {
              base: {
                ref: 'main'
              }
            }
          }
        }
      };
      const evaluator = new ConditionEvaluator(context);
      
      const config: ConditionConfig = {
        'test-condition': {
          operator: 'and',
          conditions: [
            { field: 'github.event.pull_request.base.ref', op: '=', value: 'main' }
          ]
        }
      };
      
      const result = evaluator.evaluate(config);
      expect(result.matched).toBe(true);
    });
  });
});