import { gql } from "@apollo/client";

const ROOM_FRAGMENT = gql`
  fragment RoomFragment on Room {
    id
    name
    comments {
      id
      comment
      author {
        id
        username
      }
      roomId
    }
    members {
      id
      user {
        id
        username
      }
      roomId
      userId
    }
  }
`;

const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    comment
    author {
      id
      username
    }
    roomId
  }
`;

export const COMMENT_SUBSCRIPTION = gql`
  ${COMMENT_FRAGMENT}
  subscription {
    addComment {
      ...CommentFragment
    }
  }
`;

export const CREATE_COMEMNT = gql`
  ${COMMENT_FRAGMENT}
  mutation createComment(
    $comment: String!
    $username: String!
    $roomId: String!
  ) {
    createComment(comment: $comment, username: $username, roomId: $roomId) {
      ...CommentFragment
    }
  }
`;

export const ADD_MEMBER_SUBSCRIPTION = gql`
  ${ROOM_FRAGMENT}
  subscription {
    addMember {
      ...RoomFragment
    }
  }
`;

export const REMOVE_MEMBER_SUBSCRIPTION = gql`
  ${ROOM_FRAGMENT}
  subscription {
    removeMember {
      ...RoomFragment
    }
  }
`;

export const FETCH_ROOM = gql`
  ${ROOM_FRAGMENT}
  query fetchRoom($slug: String!) {
    fetchRoom(slug: $slug) {
      ...RoomFragment
    }
  }
`;

export const ADD_MEMBER = gql`
  ${ROOM_FRAGMENT}
  mutation addMember($slug: String!, $username: String!) {
    addMember(slug: $slug, username: $username) {
      ...RoomFragment
    }
  }
`;

export const REMOVE_MEMBER = gql`
  ${ROOM_FRAGMENT}
  mutation removeMember($slug: String!, $username: String!) {
    removeMember(slug: $slug, username: $username) {
      ...RoomFragment
    }
  }
`;
