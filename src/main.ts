import * as core from '@actions/core';
import { ConditionEvaluator } from './evaluator';
import {
  loadConditionsFromFile,
  parseJsonString,
  generateMatrix,
  formatOutput,
  debugLog,
  getContextFromEnvironment
} from './utils';
import { ActionInputs, ConditionConfig } from './types';

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    debugLog('Action inputs:', inputs);
    
    const conditions = loadConditions(inputs);
    debugLog('Loaded conditions:', conditions);
    
    const contextData = getContextFromEnvironment();
    debugLog('Context data:', contextData);
    
    const evaluator = new ConditionEvaluator(contextData);
    const result = evaluator.evaluate(conditions);
    debugLog('Evaluation result:', result);
    
    const outputsList = result.matched ? [result.outputs] : [];
    const matrix = generateMatrix(outputsList);
    
    core.setOutput('matrix', formatOutput(matrix));
    
    core.info('✅ Dynamic Matrix Generator Action Completed Successfully');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Action failed: ${error.message}`);
      if (error.stack) {
        core.debug(error.stack);
      }
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

function getInputs(): ActionInputs {
  return {
    conditionsFile: core.getInput('conditions-file'),
    conditionsJson: core.getInput('conditions-json')
  };
}

function loadConditions(inputs: ActionInputs): ConditionConfig {
  if (!inputs.conditionsFile && !inputs.conditionsJson) {
    throw new Error('Either conditions-file or conditions-json must be provided');
  }

  if (inputs.conditionsFile && inputs.conditionsJson) {
    throw new Error('Only one of conditions-file or conditions-json should be provided, not both');
  }
  
  if (inputs.conditionsFile) {
    core.info(`Loading conditions from file: ${inputs.conditionsFile}`);
    return loadConditionsFromFile(inputs.conditionsFile);
  }
  
  core.info('Loading conditions from JSON input');
  return parseJsonString(inputs.conditionsJson!, 'conditions-json');
}

if (require.main === module) {
  run();
}

export { run };