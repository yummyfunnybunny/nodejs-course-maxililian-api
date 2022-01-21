// GRAPHQL
const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  schema {
    query: RootQuery
    mutation: RootMutation
  }
  
  type RootQuery {
    login(email: String!, password: String!): AuthData!
    posts(page: Int!): PostData!
    post(id: ID!): Post!
    user: User!
  }

    type RootMutation {
    createUser(userInput:UserInputData): User!
    createPost(postInput: PostInputData): Post!
    updatePost(id: ID!, postInput: PostInputData): Post!
    deletePost(id: ID!): Boolean
    updateStatus(status: String!): User!
  }

  type PostData {
    posts: [Post!]!
    totalPosts: Int!
  }

  type User {
    _id: ID!
    name: String!
    email: String
    password: String
    status: String
    posts: [Post!]!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }
`);

// NOTE: graphQL does not know dates, so in the createdAt/updatedAt fields we just set them to 'STRING!'
// NOTE: the field type 'ID' tells graphql that this field is unique and should be treated like an id

// module.exports = buildSchema(`
//   schema {
//     query: RootQuery
//   }

//   type RootQuery {
//       hello: TestData!
//       goodbye: String!
//   }

//   type TestData {
//     text: String!
//     views: Int!
//   }
// `);
// NOTE: there is no colon after 'schema'
// NOTE: adding a '!' makes something required
// NOTE: 'schema' is like the master query, which calls upon 'RootQuery', containing all other 'sub-queries'
// NOTE: you can create a new type, which we call 'TestData' above, with a more structured set of requirements
// you than call upon that new type within a subquery inside of the 'RootQuery'

// NOTE: the example below shows how you simply make a call for some random string inside the 'hello' subquery
// module.exports = buildSchema(`
//   schema {
//     query: RootQuery
//   }

//   type RootQuery {
//       hello: String!
//   }
// `);

// NOTE: Here is an example of the post request that we make for this hello query:

// URL: 'http://localhost:8080/graphql
// BODY: {
//   "query": "{ hello { text views } }"
// }

// the key MUST be 'query;. that is what graphql looks for
// 'hello' refers to the query that we want to run
// 'text/views' space separated values that we want graphql to return to us
