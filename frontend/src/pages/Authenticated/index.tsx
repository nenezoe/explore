import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthenticatedProps } from "../../types";
import Profile from "./Profile";

function Authenticated(authenticatedProps: AuthenticatedProps) {
  const { user } = authenticatedProps;
  return (
    <>
      <Routes>
        <Route path="/" element={<Profile {...authenticatedProps} />} />
      </Routes>
    </>
  );
}

export default Authenticated;
