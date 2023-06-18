# Brick CLI

This is the command line interface for working with Brick Schemas on brick-cms.com

## Installation

`yarn add -D @brick-cms/cli`

## Getting Started

If you've just installed the CLI, you'll also want to head over to brickcms.io/signup and create an account.
You can then create an API key from within your organization settings. 

From there, you can take the following steps to get started:

1. Initialize the CLI in your project

```bash
yarn brick init
```

2. Add some types to your `brick.graphqls` schema file (or use a template):

```graphql
interface Brick {
  id: String!
}

type Post implements Brick {
  id: String!
  title: String!
  # ...
}

type Query {
  posts: [Post!]!
}
```

3. Run [Codegen](https://the-guild.dev/graphql/codegen) with your favorite GraphQL client like [urql](https://formidable.com/open-source/urql/), or [Apollo](https://www.apollographql.com/docs/react/)

```yaml
# brick-codegen.yml
overwrite: true
schema: "https://api.brick-cms.com/my-organization"
generates:
  src/bricktypes.ts:
    plugins:
      - "typescript"
      - "typescript-operations"
    config:
      nonOptionalTypename: true
      useImplementingTypes: true
```

```json
// package.json
{
  "scripts": {
    "brick codegen": "graphql-codegen --config brick-codegen.yml"
  }
}
```

```bash
yarn brick codegen
```

4. Fetch your content!

```gql
query GetPosts {
  posts {
    title
  }
}
```

### Documentation

For further reading, check out brick-cms.com/docs

