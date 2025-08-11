import {
  generateMatrix,
  mergeOutputs,
  getContextFromEnvironment
} from '../src/utils.js'
import { JsonObject } from '../src/types.js'

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
  })
})
