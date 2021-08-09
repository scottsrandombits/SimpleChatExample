import React, { useEffect } from "react";

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@material-ui/core";

import ChatuseStyles from "./chat_styles";
import {
  ADD_MEMBER,
  ADD_MEMBER_SUBSCRIPTION,
  COMMENT_SUBSCRIPTION,
  FETCH_ROOM,
  REMOVE_MEMBER,
  REMOVE_MEMBER_SUBSCRIPTION,
} from "./chat_graphql";
import { useHistory, useParams } from "react-router";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { CURRENT_USER } from "../../graphql";
import { CommentForm } from "./commentForm";

export const ChatContainer = () => {
  const history = useHistory();
  const { data: userData } = useQuery(CURRENT_USER, {
    variables: { token: localStorage.getItem("token") },
  });

  if (!userData || !userData.currentUser.username) {
    history.push("/login");
  }

  const { id }: any = useParams();

  if (!id) {
    history.push("/rooms");
  }

  const classes = ChatuseStyles();

  const { loading, error, data, refetch } = useQuery(FETCH_ROOM, {
    variables: { slug: id },
  });
  const [addMember] = useMutation(ADD_MEMBER);
  const [removeMember] = useMutation(REMOVE_MEMBER);
  const { data: commentSubscription } = useSubscription(COMMENT_SUBSCRIPTION, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      if (subscriptionData && subscriptionData.data.addComment.roomId == id) {
        refetch();
      }
    },
  });

  const { data: addMemberSubscription } = useSubscription(
    ADD_MEMBER_SUBSCRIPTION,
    {
      onSubscriptionData: ({ client, subscriptionData }) => {
        if (subscriptionData && subscriptionData.data.id === id) {
          refetch();
        }
      },
    }
  );

  const { data: removeMemberSubscription } = useSubscription(
    REMOVE_MEMBER_SUBSCRIPTION,
    {
      onSubscriptionData: ({ client, subscriptionData }) => {
        if (subscriptionData && subscriptionData.data.id === id) {
          refetch();
        }
      },
    }
  );

  useEffect(() => {
    addMember({
      variables: { slug: id, username: userData.currentUser.username },
    });

    return () => {
      removeMember({
        variables: { slug: id, username: userData.currentUser.username },
      });
    };
  }, []);

  return loading ? (
    <div className={classes.root}>
      <CircularProgress />
    </div>
  ) : (
    <div>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={3} className={classes.borderRight500}>
          <List>
            {data.fetchRoom.members.map((member: any) => (
              <ListItem button key={member.id}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary={`${member.user.username}`}
                ></ListItemText>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={9}>
          <List className={classes.messageArea}>
            {data.fetchRoom.comments.map((comment: any) => (
              <ListItem key={comment.id}>
                <Grid container>
                  <Grid item xs={12}>
                    <ListItemText primary={`${comment.comment}`}></ListItemText>
                  </Grid>
                  <Grid item xs={12}>
                    <ListItemText
                      secondary={`${comment.author.username}`}
                    ></ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Grid container>
            <Grid item xs={10}>
              <CommentForm
                username={userData.currentUser.username}
                roomId={id}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
