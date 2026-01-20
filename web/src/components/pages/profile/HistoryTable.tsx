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
        <Table striped bordered hover responsive>
            <thead>
                <tr>
                    <th>Job ID</th>
                    <th>Status</th>
                    <th># of sequences</th>
                    <th>Actions</th>
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
    );
};

export default JobHistoryTable;
