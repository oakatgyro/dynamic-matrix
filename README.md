# Dynamic Matrix Generator Action

A powerful GitHub Action that generates dynamic matrices based on conditional
logic. This action evaluates complex conditions against context data and
produces GitHub Actions-compatible matrix outputs.

## Features

- 🔀 **Conditional Logic**: Support for AND/OR operators with nested conditions
- 📊 **Dynamic Matrix Generation**: Create matrices based on runtime conditions
- 🎯 **Flexible Operators**: Equality, comparison, contains, starts_with,
  ends_with
- 🔄 **Environment Variable Expansion**: Automatic expansion of `${VAR}` syntax
- 📦 **Multiple Output Formats**: Generate matrices or merged outputs
- 🏷️ **Named Conditions**: Track which conditions matched

## Installation

Use this action in your workflow:

```yaml
- uses: ./dynamic-matrix-action # or your-org/dynamic-matrix-action@v1
  with:
    conditions-file: conditions.json
```

## Inputs

| Input             | Description                   | Required |
| ----------------- | ----------------------------- | -------- |
| `conditions-file` | Path to conditions JSON file  | No\*     |
| `conditions-json` | Inline conditions JSON string | No\*     |

\*Either `conditions-file` or `conditions-json` must be provided

## Outputs

| Output   | Description                               |
| -------- | ----------------------------------------- |
| `matrix` | Generated matrix in GitHub Actions format |

## Condition Configuration

### Basic Structure

```json
{
  "condition-name": {
    "operator": "and",
    "conditions": [
      {
        "field": "branch",
        "op": "=",
        "value": "main"
      }
    ],
    "outputs": {
      "env": "production",
      "deploy": true
    }
  }
}
```

### Supported Operators

#### Comparison Operators

- `=` - Equality
- `!=` - Inequality
- `>` - Greater than
- `>=` - Greater than or equal
- `<` - Less than
- `<=` - Less than or equal

#### String Operators

- `contains` - Check if string/array contains value
- `not_contains` - Check if string/array doesn't contain value
- `starts_with` - Check if string starts with value
- `ends_with` - Check if string ends with value

#### Logical Operators

- `and` - All conditions must match
- `or` - At least one condition must match

### Nested Conditions

```json
{
  "deploy-condition": {
    "operator": "or",
    "conditions": [
      {
        "operator": "and",
        "conditions": [
          { "field": "branch", "op": "=", "value": "main" },
          { "field": "event", "op": "=", "value": "push" }
        ]
      },
      {
        "operator": "and",
        "conditions": [
          { "field": "branch", "op": "=", "value": "develop" },
          { "field": "event", "op": "=", "value": "pull_request" }
        ]
      }
    ],
    "outputs": {
      "should_deploy": true
    }
  }
}
```

## Examples

### Example 1: Environment-based Matrix

**conditions.json:**

```json
{
  "dev-environment": {
    "operator": "and",
    "conditions": [{ "field": "branch", "op": "=", "value": "develop" }],
    "outputs": {
      "env": "dev",
      "account": "123456",
      "region": "us-east-1"
    }
  },
  "prod-environment": {
    "operator": "and",
    "conditions": [
      { "field": "branch", "op": "=", "value": "main" },
      { "field": "event", "op": "=", "value": "push" }
    ],
    "outputs": {
      "env": "prod",
      "account": "789012",
      "region": "us-west-2"
    }
  }
}
```

**Workflow:**

```yaml
jobs:
  generate-matrix:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.matrix.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4

      - id: matrix
        uses: ./dynamic-matrix-action
        with:
          conditions-file: conditions.json

  deploy:
    needs: generate-matrix
    if: needs.generate-matrix.outputs.matrix != '{"include":[]}'
    strategy:
      matrix: ${{ fromJson(needs.generate-matrix.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Deploying to ${{ matrix.env }}"
          echo "AWS Account: ${{ matrix.account }}"
          echo "Region: ${{ matrix.region }}"
```

### Example 2: PR Label-based Actions

```yaml
- uses: ./dynamic-matrix-action
  id: check-labels
  with:
    conditions-json: |
      {
        "label-check": {
          "operator": "or",
          "conditions": [
            { "field": "labels", "op": "contains", "value": "needs-review" },
            { "field": "labels", "op": "contains", "value": "ready-to-merge" }
          ],
          "outputs": {
            "action": "review-required"
          }
        }
      }
```

### Example 3: File Change Detection

```yaml
- uses: ./dynamic-matrix-action
  with:
    conditions-json: |
      {
        "frontend-changes": {
          "operator": "or",
          "conditions": [
            { "field": "changed_files", "op": "contains", "value": "src/frontend" },
            { "field": "changed_files", "op": "contains", "value": "package.json" }
          ],
          "outputs": {
            "test_suite": "frontend",
            "build_command": "npm run build"
          }
        },
        "backend-changes": {
          "operator": "and",
          "conditions": [
            { "field": "changed_files", "op": "contains", "value": "src/backend" }
          ],
          "outputs": {
            "test_suite": "backend",
            "build_command": "go build"
          }
        }
      }
```

## Advanced Features

### Nested Field Access

Access nested fields using dot notation:

```json
{
  "conditions": [
    {
      "field": "github.event.pull_request.base.ref",
      "op": "=",
      "value": "main"
    }
  ]
}
```

### Available Context Variables

The action automatically provides GitHub Actions context:

- `github.ref` - The ref that triggered the workflow
- `github.ref_name` - The branch or tag name
- `github.event_name` - The name of the event that triggered the workflow
- `github.repository` - The owner and repository name
- `github.actor` - The user that triggered the workflow
- `github.sha` - The commit SHA
- `event.*` - Full event payload (e.g., `event.pull_request.labels`)
- `env.*` - All environment variables

## Development

### Setup

```bash
npm install
```

### Test

```bash
npm test
```

### Build

```bash
npm run package       # Build the action
npm run bundle        # Format and package
```

### Format & Lint

```bash
npm run format:write  # Format all files
npm run format:check  # Check formatting
npm run lint          # Lint TypeScript files
```

### Other Commands

```bash
npm run coverage      # Generate coverage badge
npm run package:watch # Watch mode for development
npm run all          # Run format, lint, test, coverage, and package
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
