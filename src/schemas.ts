const homepageSchema = `
type Query {
  homepage: Homepage
}

interface Brick {
  id: String!
}

type Hero implements Brick {
  id: String!
  title: String!
  subtitle: String
}

type Section implements Brick {
  id: String!
  headline: String!
  copy: String!
}

union HomepageComponent = Section

type Homepage implements Brick {
  id: String!
  hero: Hero!
  lineup: [HomepageComponent]
}
`;

const noneSchema = `
type Query {
}

interface Brick {
  id: String!
}
`

export default {
  'home-page': homepageSchema.trim(),
  'none': noneSchema.trim()
}