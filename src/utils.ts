import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
import { ConditionConfig, MatrixOutput } from './types';

export function loadConditionsFromFile(filePath: string): ConditionConfig {
  try {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Conditions file not found: ${absolutePath}`);
    }

    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to load conditions from file: ${error}`);
  }
}

export function parseJsonString(jsonString: string, fieldName: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse ${fieldName}: ${error}`);
  }
}

export function generateMatrix(outputs: Record<string, any>[]): MatrixOutput {
  if (outputs.length === 0) {
    return { include: [] };
  }

  const uniqueOutputs = removeDuplicates(outputs);
  
  return {
    include: uniqueOutputs
  };
}

function removeDuplicates(array: Record<string, any>[]): Record<string, any>[] {
  const seen = new Set<string>();
  const result: Record<string, any>[] = [];

  for (const item of array) {
    const key = JSON.stringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

export function mergeOutputs(outputsList: Record<string, any>[]): Record<string, any> {
  return outputsList.reduce((merged, outputs) => {
    return { ...merged, ...outputs };
  }, {});
}

export function formatOutput(value: any): string {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}

export function debugLog(message: string, data?: any): void {
  core.debug(message);
  if (data !== undefined) {
    core.debug(JSON.stringify(data, null, 2));
  }
}

export function getContextFromEnvironment(): Record<string, any> {
  const context: Record<string, any> = {};
  
  // GitHub Actions context
  if (process.env.GITHUB_ACTIONS) {
    context.github = {
      ref: process.env.GITHUB_REF || '',
      ref_name: process.env.GITHUB_REF_NAME || '',
      event_name: process.env.GITHUB_EVENT_NAME || '',
      repository: process.env.GITHUB_REPOSITORY || '',
      actor: process.env.GITHUB_ACTOR || '',
      sha: process.env.GITHUB_SHA || '',
      run_number: process.env.GITHUB_RUN_NUMBER || '',
      run_id: process.env.GITHUB_RUN_ID || '',
      workflow: process.env.GITHUB_WORKFLOW || '',
      job: process.env.GITHUB_JOB || ''
    };
    
    // Parse event data if available
    if (process.env.GITHUB_EVENT_PATH) {
      try {
        const fs = require('fs');
        const eventData = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
        context.event = eventData;
      } catch (error) {
        core.debug(`Failed to parse GitHub event data: ${error}`);
      }
    }
  }
  
  // Add all environment variables
  context.env = { ...process.env };
  
  return context;
}