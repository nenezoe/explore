import { Dispatch, SetStateAction } from "react";
// import { History, LocationState } from "history";

export interface User {
  firstName?: string;
  group?: string;
  lastName?: string;
  username?: string;
  uuid: string;
}
export interface ProfileLoadResponse {
  success?: boolean;
  user: User;
  message?: string;
}
export interface UnauthenticatedProps {
  setUser: Dispatch<SetStateAction<User>>;
}
export interface AuthenticatedProps {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}
