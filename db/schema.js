const { gql } = require("apollo-server");

const typeDefs = gql`
  type Group {
    name: String
    id: ID
  }

  type Player {
    name: String
    lastName: String
    id: ID
    wins: Int
    groups: [String]
  }

  type Token {
    token: String
  }

  type Query {
    getGroups: [Group]
    getPlayers: [Player]
  }

  input NewGroupInput {
    name: String!
  }

  input PlayerInput {
    name: String!
    lastName: String
  }

  input PlayerToGroup {
    group: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  input UserAutenticate {
    email: String!
    password: String!
  }

  type Mutation {
    createUser(input: UserInput): String
    autenticateUser(input: UserAutenticate): Token

    newGroup(input: NewGroupInput): Group
    updateGroup(id: ID!, input: NewGroupInput): Group
    removeGroup(id: ID!): String

    newPlayer(input: PlayerInput): Player
    updatePlayer(id: ID!, input: PlayerInput): Player
    removePlayer(id: ID!): String
    addPlayerToGroup(id: ID!, input: PlayerToGroup): Player
    removePlayerFromGroup(id: ID!, input: PlayerToGroup): String
    addPlayerWin(id: ID!): Player
  }
`;

module.exports = typeDefs;
