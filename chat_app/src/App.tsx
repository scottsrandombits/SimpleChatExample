import React, { useEffect, useState } from "react";
import {
  AppBar,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import MenuIcon from "@material-ui/icons/Menu";

import { ChatContainer } from "./components/chat/container";
import { RoomContainer } from "./components/room/container";
import "./app.css";
import { LoginContainer } from "./components/login/container";

import { RouteGuard } from "./utility/RouteGuard";
import { CURRENT_USER } from "./graphql";
import { useQuery } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  linkButton: {
    color: "white",
    textDecoration: "none",
  },
}));

function App() {
  const classes = useStyles();

  const { data: userData } = useQuery(CURRENT_USER, {
    variables: { token: localStorage.getItem("token") },
  });

  let login = undefined;

  if (!userData) {
    login = (
      <Link className={classes.linkButton} to="/login">
        <Button color="inherit">Login</Button>
      </Link>
    );
  }

  return (
    <div>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Best Chat App Eva
            </Typography>
            <Link className={classes.linkButton} to="/rooms">
              <Button color="inherit">Rooms</Button>
            </Link>
            {login}
          </Toolbar>
        </AppBar>
        <Container>
          <Switch>
            <Route path="/login">
              <LoginContainer />
            </Route>
            <RouteGuard path="/room/:id" component={ChatContainer} />
            <RouteGuard path="/rooms" component={RoomContainer} />
          </Switch>
        </Container>
      </Router>
    </div>
  );
}

export default App;
