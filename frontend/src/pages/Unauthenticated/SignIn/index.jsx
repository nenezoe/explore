import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
export default function SignIn(props) {
  const navigate = useNavigate();
  const { setUser } = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Form inline>
      <FormGroup>
        <Label for="exampleUsername" hidden>
          Username
        </Label>
        <Input
          type="text"
          name="username"
          id="exampleUsername"
          value={username}
          onChange={(event) => {
            event.preventDefault();
            setUsername(event.target.value);
          }}
          placeholder="Username"
        />
      </FormGroup>{" "}
      <FormGroup>
        <Label for="examplePassword" hidden>
          Password
        </Label>
        <Input
          type="password"
          name="password"
          id="examplePassword"
          value={password}
          onChange={(event) => {
            event.preventDefault();
            setPassword(event.target.value);
          }}
          placeholder="Password"
        />
      </FormGroup>{" "}
      <Button
        onClick={(event) => {
          event.preventDefault();
          fetch("/login", {
            method: "POST", // or 'PUT'
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success && data.user) {
                setUser(data.user);
                navigate("/", { replace: true });
                alert(data.message || "Login Successful");
              } else {
                alert(data.message || "Login failed");
              }
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }}
      >
        Login
      </Button>
    </Form>
  );
}
