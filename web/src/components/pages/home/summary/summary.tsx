import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import style from './summary.module.css';
import CompactVisitorMap from './CompactVisitorMap';

interface SummaryState {
    visitors: number;
    num_protein: number;
    num_sites: number;
}

class Summary extends Component<{}, SummaryState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            visitors: 0,
            num_protein: 0,
            num_sites: 0
        };
    }

    componentDidMount() {
        this.getVisitors();
        this.getProcessedNumbers();
    }

    async getVisitors() {
        try {
            const response = await fetch('../static/visitors/visitors_ip.json');
            if (!response.ok) throw new Error('Failed to fetch visitors');
            const data = await response.json();
            const visitorList: any[] = data.visitors || [];
            this.setState({ visitors: visitorList.length });
        } catch (error) {
            console.error(error);
        }
    }

    async getProcessedNumbers() {
        try {
            const response = await fetch('../static/visitors/processed_protein_record.txt');
            if (!response.ok) throw new Error('Failed to fetch processed numbers');
            const text = await response.text();
            const lines = text.split(/[\n\r]+/);
            this.setState({
                num_protein: Number(lines[0]) || 0,
                num_sites: Number(lines[1]) || 0
            });
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        const { visitors, num_protein, num_sites } = this.state;

        return (
            <div className={style.titleSection}>
                <Container>
                    <Row className={`${style.titleRow} justify-content-between`}>
                        <Col md={7} className={style.titleColumn}>
                            <h1 className={style.mainTitle}>MUSITE</h1>
                            <p className={style.subtitle}>
                                A deep-learning framework for protein post-translational modification site prediction
                            </p>
                        </Col>
                        <Col md={4} className={style.mapColumn}>
                            <div className={style.mapContainer}>
                                <CompactVisitorMap height={170} />
                                
                                <div className={style.statsOverlay}>
                                    <div className={visitors > 0 ? style.statLine : style.visitorsHide}>
                                        The number of total users
                                    </div>
                                    <div className={visitors > 0 ? style.statNumber : style.visitorsHide}>
                                        <span className={style.flipit}>{visitors.toLocaleString()}</span>
                                    </div>
                                    
                                    <div className={num_protein > 0 ? style.statLine : style.visitorsHide}>
                                        The number of total queries
                                    </div>
                                    <div className={num_protein > 0 ? style.statNumber : style.visitorsHide}>
                                        <span className={style.flipit}>{num_protein.toLocaleString()}</span>
                                    </div>
                                    
                                    <div className={num_sites > 0 ? style.statLine : style.visitorsHide}>
                                        The number of total proteins
                                    </div>
                                    <div className={num_sites > 0 ? style.statNumber : style.visitorsHide}>
                                        <span className={style.flipit}>{num_sites.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Summary;
