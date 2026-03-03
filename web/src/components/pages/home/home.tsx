import React, { useRef } from "react";
import Summary from "./summary/summary";
import Footer from "./footer/footer";
import CombinePredict from "./predict/CombinePredict";
import { Container, Row, Col } from 'react-bootstrap';
const Home: React.FC = () => {

  return (
    <div>
      <Summary />
      
      {/* Main content section with form and citation */}
      <Container fluid className="px-4 my-4" style={{ maxWidth: '1400px' }}>
        <Row className="g-4">
          {/* Left - Form */}
          <Col lg={8} md={12} style={{ position: 'relative', zIndex: 10 }}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <CombinePredict />
              </div>
            </div>
          </Col>
          
          {/* Right - Citation */}
          <Col lg={4} md={12}>
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">Citation</h5>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Wang, D. et al. (2020) MusiteDeep: a deep-learning based webserver for protein post-translational modification site prediction and visualization. <em>Nucleic Acids Research</em>, Volume 48, Issue W1, 02 July 2020, Pages W140–W146.
                </p>
                
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Wang, D. et al. (2019) Capsule network for protein post-translational modification site prediction. <em>Bioinformatics</em>, 35(14), 2386-2394.
                </p>
                
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: 0 }}>
                  Wang, D. et al. (2017) MusiteDeep: a deep-learning framework for general and kinase-specific phosphorylation site prediction. <em>Bioinformatics</em>, 33(24), 3909-3916.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      
      <Footer />
    </div>
  );
};

export default Home;
