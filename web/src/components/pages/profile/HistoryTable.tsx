import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import style from './profile.module.css';
import React, { useEffect, useRef, useState } from 'react';


interface JobHistoryTableProps {
    records: string[];
    jobStatusList: string[];
    jobSeqnumList: number[];
    handlers: {
        handleShowResult: (jobId: string) => void;
        handleDownload: (jobId: string) => void;
        handleDelete: (jobId: string) => void;
        handleShowunsubmit: (jobId: string) => void;
    };
}


const JobHistoryTable: React.FC<JobHistoryTableProps> = ({
    records,
    jobStatusList,
    jobSeqnumList,
    handlers
}) => {
    return (
        <div style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <Table bordered hover responsive className="table-sm mb-0">
            <thead style={{ backgroundColor: '#1e466e', color: '#fff' }}>
                <tr>
                    <th style={{ fontWeight: 600, fontSize: '0.875rem', borderColor: '#163755' }}>Job ID</th>
                    <th style={{ fontWeight: 600, fontSize: '0.875rem', borderColor: '#163755' }}>Status</th>
                    <th style={{ fontWeight: 600, fontSize: '0.875rem', borderColor: '#163755' }}># of sequences</th>
                    <th style={{ fontWeight: 600, fontSize: '0.875rem', borderColor: '#163755' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {records.map((jobId, idx) => (
                    <tr key={jobId}>
                        <td>{jobId}</td>
                        <td>{jobStatusList[idx]}</td>
                        <td>{jobSeqnumList[idx]}</td>
                        <td>
                            <div>
                                {jobStatusList[idx] === 'unsubmit' ? (
                                    <Button size="sm" onClick={() => handlers.handleShowunsubmit(jobId)} style={{ marginRight: '10px' }}>
                                        Show
                                    </Button>
                                ) : (
                                    <Button size="sm" onClick={() => handlers.handleShowResult(jobId)} style={{ marginRight: '10px' }}>
                                        Show
                                    </Button>
                                )}
                                <Button size="sm" onClick={() => handlers.handleDownload(jobId)} style={{ marginRight: '10px' }}>
                                    Download
                                </Button>
                                <Button size="sm" onClick={() => handlers.handleDelete(jobId)}>
                                    Delete
                                </Button>
                            </div>

                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
        </div>
    );
};

export default JobHistoryTable;
