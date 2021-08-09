import React from "react";

import { useQuery } from "@apollo/client";
import { useHistory } from "react-router";
import { Route } from "react-router-dom";
import { CURRENT_USER } from "../graphql";

export const RouteGuard = (props: any) => {
  // eslint-disable-next-line
  const { loading, error, data } = useQuery(CURRENT_USER, {
    variables: { token: localStorage.getItem("token") },
  });
  const history = useHistory();

  if (!data && !loading) {
    history.push("/login");
  }

  return <Route path={props.path} component={props.component} />;
};
