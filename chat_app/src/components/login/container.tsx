import React from "react";

import { Button, LinearProgress, TextField } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { gql, useMutation } from "@apollo/client";
import { useHistory } from "react-router";

const CREATE_USER = gql`
  mutation createUser($username: String!) {
    createUser(username: $username) {
      id
      username
      token
    }
  }
`;

export const LoginContainer = () => {
  const [createUser] = useMutation(CREATE_USER);
  const history = useHistory();

  if (localStorage.getItem("token")) {
    history.push("/rooms");
  }

  return (
    <div>
      <h2>Login</h2>
      <Formik
        initialValues={{
          username: "",
        }}
        onSubmit={(values: { username: string }, { setSubmitting }) => {
          createUser({
            variables: {
              username: values.username,
            },
          })
            .then((response) => {
              localStorage.setItem("token", response.data.createUser.token);
              console.log("logging in");
              history.push("/rooms");
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
              name="username"
              type="username"
              label="username"
              id="username"
              variant="outlined"
              value={values.username}
              onChange={handleChange}
              helperText={
                errors.username && touched.username && errors.username
              }
              margin="normal"
            />

            {/* <Field name="username" type="username" label="username" /> */}

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
    </div>
  );
};
