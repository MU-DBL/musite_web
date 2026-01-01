import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './header.css';

class Header extends React.Component {
  render() {
    return (
      <Navbar bg="dark" variant="dark" expand="md" fixed="top">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>HOME</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-0">
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

              <Nav.Link
                href="http://gene.rnet.missouri.edu/musite"
                target="_blank"
                rel="noreferrer"
              >
                Musite (SVM version)
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default Header;
