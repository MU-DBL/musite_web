import React, { Component } from 'react';
import style from './summary.module.css';

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
            <div className={style.summary}>
                <div className={style.text}>
                    <p style={{ marginTop: '10px' }}>
                        MusiteDeep: a deep-learning framework for protein post-translational modification site prediction
                    </p>
                </div>

                <div className={visitors > 0 ? style.visitors : style.visitorsHide}>
                    <span className={style.flipit}>{visitors}</span> unique visitors
                </div>

                <div className={num_protein > 0 ? style.num_protein : style.visitorsHide}>
                    <span className={style.flipit}>{num_protein}</span> processed proteins
                </div>

                <div className={num_sites > 0 ? style.num_sites : style.visitorsHide}>
                    <span className={style.flipit}>{num_sites}</span> processed amino acids
                </div>
            </div>
        );
    }
}

export default Summary;
