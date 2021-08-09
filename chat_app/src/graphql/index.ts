import { gql } from "@apollo/client";

export const CURRENT_USER = gql`
  query currentUser($token: String) {
    currentUser(token: $token) {
      username
      id
      token
    }
  }
`;

export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
  }
`;
