import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './header.css';

const Header: React.FC = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="md" fixed="top">
      <Container>
       
        <LinkContainer to="/">
            <Navbar.Brand>
                <img src="/img/logo.png" className="navbar-logo" />
            </Navbar.Brand>
        </LinkContainer>

        <LinkContainer to="/">
        <Navbar.Brand>
            <span className="navbar-brand-text">MUSITE</span>
        </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-0">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/profile">
              <Nav.Link>Job History</Nav.Link>
            </LinkContainer>

            <NavDropdown title="Download" id="download-dropdown">
              <LinkContainer to="/ptm">
                <NavDropdown.Item>PTM Data</NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Item
                href="https://github.com/duolinwang/MusiteDeep_web"
                target="_blank"
                rel="noreferrer"
              >
                Stand-alone Tool
              </NavDropdown.Item>
            </NavDropdown>

            <LinkContainer to="/api">
              <Nav.Link>API</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/contact">
              <Nav.Link>Contact</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/help">
              <Nav.Link>Help</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;