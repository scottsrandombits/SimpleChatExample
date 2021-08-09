import React from "react";

import {
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { Link, useHistory } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";

const CREATE_ROOM = gql`
  mutation createRoom($name: String!) {
    createRoom(name: $name) {
      name
      id
    }
  }
`;

const FETCH_ROOMS = gql`
  query {
    fetchRooms {
      id
      name
    }
  }
`;

export const RoomContainer = () => {
  const [createRoom] = useMutation(CREATE_ROOM);
  const { loading, error, data } = useQuery(FETCH_ROOMS);
  const history = useHistory();

  return (
    <div>
      {error ? "Error" : ""}
      <Formik
        initialValues={{
          name: "",
        }}
        onSubmit={(values, { setSubmitting }) => {
          createRoom({
            variables: {
              name: values.name,
            },
            refetchQueries: [{ query: FETCH_ROOMS }],
          })
            .then((response) => {
              console.log(response);
              history.push(`/room/${response.data.createRoom.id}`);
              setSubmitting(false);
            })
            .catch(console.log);
        }}
      >
        {({
          submitForm,
          isSubmitting,
          values,
          handleChange,
          errors,
          touched,
        }) => (
          <Form>
            <Field
              component={TextField}
              style={{ display: "flex", background: "white" }}
              name="name"
              type="name"
              label="name"
              id="name"
              variant="outlined"
              value={values.name}
              onChange={handleChange}
              helperText={errors.name && touched.name && errors.name}
              margin="normal"
            />

            {/* <Field name="name" type="username" label="username" /> */}

            {isSubmitting && <LinearProgress />}
            <br />
            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={submitForm}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
      <h2>Rooms</h2>
      {loading ? (
        <div>"loading...</div>
      ) : (
        <List component="nav">
          {data.fetchRooms.map((room: any) => (
            <Link key={room.id} to={`/room/${room.id}`}>
              <ListItem button>
                <ListItemText>{room.name}</ListItemText>
              </ListItem>
            </Link>
          ))}
        </List>
      )}
    </div>
  );
};
