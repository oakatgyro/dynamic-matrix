import {
  generateMatrix,
  mergeOutputs,
  getContextFromEnvironment,
  loadConditionsFromFile,
  parseJsonString,
  formatOutput
} from '../src/utils.js'
import { JsonObject } from '../src/types.js'
import * as fs from 'fs'

describe('Utils', () => {
  describe('generateMatrix', () => {
    test('should generate matrix from outputs', () => {
      const outputs = [
        { env: 'dev', account: '123' },
        { env: 'prod', account: '456' }
      ]

      const matrix = generateMatrix(outputs)
      expect(matrix.include).toHaveLength(2)
      expect(matrix.include[0]).toEqual({ env: 'dev', account: '123' })
      expect(matrix.include[1]).toEqual({ env: 'prod', account: '456' })
    })

    test('should remove duplicate outputs', () => {
      const outputs = [
        { env: 'dev', account: '123' },
        { env: 'dev', account: '123' },
        { env: 'prod', account: '456' }
      ]

      const matrix = generateMatrix(outputs)
      expect(matrix.include).toHaveLength(2)
    })

    test('should handle empty outputs', () => {
      const matrix = generateMatrix([])
      expect(matrix.include).toHaveLength(0)
    })
  })

  describe('mergeOutputs', () => {
    test('should merge multiple output objects', () => {
      const outputs = [
        { env: 'dev', region: 'us-east-1' },
        { account: '123456' },
        { deploy: true }
      ] as JsonObject[]

      const merged = mergeOutputs(outputs)
      expect(merged).toEqual({
        env: 'dev',
        region: 'us-east-1',
        account: '123456',
        deploy: true
      })
    })

    test('should override duplicate keys', () => {
      const outputs = [
        { env: 'dev', account: '111' },
        { env: 'prod', account: '222' }
      ]

      const merged = mergeOutputs(outputs)
      expect(merged).toEqual({
        env: 'prod',
        account: '222'
      })
    })
  })

  describe('getContextFromEnvironment', () => {
    beforeEach(() => {
      process.env.GITHUB_ACTIONS = 'true'
      process.env.GITHUB_REF = 'refs/heads/main'
      process.env.GITHUB_REF_NAME = 'main'
      process.env.GITHUB_EVENT_NAME = 'push'
      process.env.GITHUB_REPOSITORY = 'owner/repo'
    })

    afterEach(() => {
      delete process.env.GITHUB_ACTIONS
      delete process.env.GITHUB_REF
      delete process.env.GITHUB_REF_NAME
      delete process.env.GITHUB_EVENT_NAME
      delete process.env.GITHUB_REPOSITORY
      delete process.env.GITHUB_EVENT_PATH
    })

    test('should get GitHub Actions context', () => {
      const context = getContextFromEnvironment()
      expect(context.github).toBeDefined()
      const githubContext = context.github as JsonObject
      expect(githubContext.ref).toBe('refs/heads/main')
      expect(githubContext.ref_name).toBe('main')
      expect(githubContext.event_name).toBe('push')
      expect(githubContext.repository).toBe('owner/repo')
    })

    test('should include environment variables', () => {
      const context = getContextFromEnvironment()
      expect(context.env).toBeDefined()
      const envContext = context.env as JsonObject
      expect(envContext.GITHUB_ACTIONS).toBe('true')
    })

    test('should handle GitHub event path', () => {
      const mockEventData = { pull_request: { number: 123 } }
      const tempFile = '/tmp/test-event.json'
      fs.writeFileSync(tempFile, JSON.stringify(mockEventData))
      process.env.GITHUB_EVENT_PATH = tempFile

      const context = getContextFromEnvironment()
      expect(context.event).toEqual(mockEventData)

      fs.unlinkSync(tempFile)
    })

    test('should handle invalid GitHub event path', () => {
      process.env.GITHUB_EVENT_PATH = '/nonexistent/file.json'

      const context = getContextFromEnvironment()
      expect(context.event).toBeUndefined()
    })
  })

  describe('loadConditionsFromFile', () => {
    test('should load conditions from valid JSON file', () => {
      const tempFile = '/tmp/test-conditions.json'
      const testData = {
        'test-condition': {
          operator: 'and',
          conditions: [],
          outputs: {}
        }
      }
      fs.writeFileSync(tempFile, JSON.stringify(testData))

      const result = loadConditionsFromFile(tempFile)
      expect(result).toEqual(testData)

      fs.unlinkSync(tempFile)
    })

    test('should throw error for non-existent file', () => {
      expect(() => {
        loadConditionsFromFile('/nonexistent/file.json')
      }).toThrow('Failed to load conditions from file')
    })

    test('should throw error for invalid JSON', () => {
      const tempFile = '/tmp/invalid-json.json'
      fs.writeFileSync(tempFile, 'invalid json content')

      expect(() => {
        loadConditionsFromFile(tempFile)
      }).toThrow('Failed to load conditions from file')

      fs.unlinkSync(tempFile)
    })
  })

  describe('parseJsonString', () => {
    test('should parse valid JSON string', () => {
      const jsonString = '{"key": "value", "number": 42}'
      const result = parseJsonString(jsonString, 'testField')
      expect(result).toEqual({ key: 'value', number: 42 })
    })

    test('should throw error for invalid JSON string', () => {
      expect(() => {
        parseJsonString('invalid json', 'testField')
      }).toThrow('Failed to parse testField')
    })

    test('should handle complex JSON structures', () => {
      const jsonString = '{"nested": {"array": [1, 2, 3]}, "bool": true}'
      const result = parseJsonString(jsonString, 'complexField')
      expect(result).toEqual({
        nested: { array: [1, 2, 3] },
        bool: true
      })
    })
  })

  describe('formatOutput', () => {
    test('should return string values as-is', () => {
      expect(formatOutput('test string')).toBe('test string')
    })

    test('should stringify non-string values', () => {
      expect(formatOutput(42)).toBe('42')
      expect(formatOutput(true)).toBe('true')
      expect(formatOutput({ key: 'value' })).toBe('{"key":"value"}')
      expect(formatOutput([1, 2, 3])).toBe('[1,2,3]')
    })

    test('should handle null and undefined', () => {
      expect(formatOutput(null)).toBe('null')
      expect(formatOutput(undefined)).toBe(undefined)
    })
  })
})
