import React from "react";
import { Field, Form, Formik } from "formik";
import { TextField } from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { CREATE_COMEMNT } from "./chat_graphql";

interface ICommentForm {
  username: string;
  roomId: string;
}

export const CommentForm: React.FC<ICommentForm> = ({ username, roomId }) => {
  const [createComment] = useMutation(CREATE_COMEMNT);

  return (
    <div>
      <Formik
        initialValues={{
          comment: "",
        }}
        onSubmit={(
          values: { comment: string },
          { setSubmitting, resetForm }
        ) => {
          createComment({
            variables: {
              comment: values.comment,
              username,
              roomId,
            },
          })
            .then((response) => {
              setSubmitting(false);

              resetForm();
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
          <React.Fragment>
            <Form>
              <Field
                component={TextField}
                style={{ display: "flex", background: "white" }}
                name="comment"
                type="comment"
                id="comment"
                variant="outlined"
                value={values.comment}
                onChange={handleChange}
                helperText={errors.comment && touched.comment && errors.comment}
                label="Type Something"
                fullWidth
                margin="normal"
              />
            </Form>
          </React.Fragment>
        )}
      </Formik>
    </div>
  );
};
