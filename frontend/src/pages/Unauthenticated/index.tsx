import React, { useState, useEffect } from "react";
import {
  Container,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
} from "reactstrap";
import "./index.css";
import { Route, Routes, NavLink } from "react-router-dom";
import HomeScreen from "./HomeScreen";
import SignIn from "./SignIn";
import { UnauthenticatedProps } from "../../types";

function Unauthenticated(unauthenticatedProps: UnauthenticatedProps) {
  console.log("Unauthenticated unauthenticatedProps", unauthenticatedProps);
  const [isOpen, setIsOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  });

  const handleScroll = () => {
    if (window.scrollY > 90) {
      setSticky(true);
    } else if (window.scrollY < 90) {
      setSticky(false);
    }
  };
  return (
    <>
      <div className={`header${sticky ? " sticky" : ""}`}>
        <Navbar light expand="md">
          <Container>
            <NavLink className="navbar-brand" to="/">
              LOGO
            </NavLink>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
              <Nav className="m-auto" navbar>
                <NavItem>
                  <NavLink className="nav-link" to="/">
                    Home
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className="nav-link" to="/">
                    Features
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className="nav-link" to="/">
                    Services
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </div>
      <Routes>
        <Route path="/" element={<HomeScreen {...unauthenticatedProps} />} />
        {/* <Route path="/" element={<HomeScreen {...unauthenticatedProps} />} /> */}
        <Route path="/login" element={<SignIn {...unauthenticatedProps} />} />
        {/* <Route path="/dashboard" element={<Profile {...unauthenticatedProps} />} /> */}
      </Routes>
    </>
  );
}

export default Unauthenticated;
