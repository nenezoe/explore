import React, { useEffect, useState } from "react";
import { Container, Form, FormGroup, Label, Input, Button } from "reactstrap";
import "./index.css";
import { AuthenticatedProps } from "../../../types";

export default function Profile(props: AuthenticatedProps) {
  const { user, setUser } = props;
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  return (
    <Container>
      <p>
        Hi {user.firstName}, <a href="/logout">Logout</a>
      </p>
      <Form>
        <FormGroup>
          <Label for="group">Group</Label>
          <Input disabled value={user.group} />
        </FormGroup>
        <FormGroup>
          <Label for="username">Username</Label>
          <Input disabled value={user.username} />
        </FormGroup>
      </Form>
      <Form>
        <FormGroup>
          <Label for="firstName">First Name</Label>
          <Input
            value={firstName}
            onChange={(event) => {
              event.preventDefault();
              setFirstName(event.target.value);
            }}
          />
        </FormGroup>
        <FormGroup>
          <Label for="lastName">Last Name</Label>
          <Input
            value={lastName}
            onChange={(event) => {
              event.preventDefault();
              setLastName(event.target.value);
            }}
          />
        </FormGroup>
        <Button
          onClick={(event) => {
            event.preventDefault();
            fetch("/profile/name", {
              method: "PUT", // or 'PUT'
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ firstName, lastName }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success && data.user) {
                  setUser(data.user);
                  alert(data.message || "Name updated successfully");
                } else {
                  alert(data.message || "Name update failed");
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }}
        >
          Update Name
        </Button>
      </Form>
      <Form>
        <FormGroup>
          <Label for="oldPassword">Current Password</Label>
          <Input
            value={oldPassword}
            onChange={(event) => {
              event.preventDefault();
              setOldPassword(event.target.value);
            }}
          />
        </FormGroup>
        <FormGroup>
          <Label for="newPassword">New Password</Label>
          <Input
            value={newPassword}
            onChange={(event) => {
              event.preventDefault();
              setNewPassword(event.target.value);
            }}
          />
        </FormGroup>
        <FormGroup>
          <Label for="confirmNewPassword">Confirm Password</Label>
          <Input
            value={confirmNewPassword}
            onChange={(event) => {
              event.preventDefault();
              setConfirmNewPassword(event.target.value);
            }}
          />
        </FormGroup>
        <Button
          onClick={(event) => {
            event.preventDefault();
            fetch("/profile/password", {
              method: "PUT", // or 'PUT'
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                oldPassword,
                newPassword,
                confirmNewPassword,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success && data.user) {
                  setUser(data.user);
                  alert(data.message || "Password changed successfully");
                } else {
                  alert(data.message || "Password update failed");
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }}
        >
          Change Password
        </Button>
      </Form>
    </Container>
  );
}
