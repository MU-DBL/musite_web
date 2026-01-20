import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import Swal from 'sweetalert2';
import style from './profile.module.css';
import { useUserId } from '../../../UserContext';
import { processPTMResult } from '../functions';
import Output from '../common/output/output';
import { ModelOption } from '../../../constants';
import JobHistoryTable from './HistoryTable';

const JobHistory: React.FC = () => {
    const outputRef = useRef<HTMLDivElement>(null);

    const userId = useUserId();
    const intervalRef = useRef<number | null>(null);

    const [PTM, setPTM] = useState<ModelOption[]>([]);
    const [records, setRecords] = useState<string[]>([]);
    const [jobStatusList, setJobStatusList] = useState<string[]>([]);
    const [jobSeqnumList, setJobSeqnumList] = useState<number[]>([]);
    const [space, setSpace] = useState<number>(0);

    const [showOutput, setShowOutput] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);

    // Output-related state
    const [inputs, setInputs] = useState<string[][]>([]);
    const [title, setTitle] = useState<string[]>([]);
    const [titleIndex, setTitleIndex] = useState<{ label: string; value: number }[]>([]);
    const [results, setResults] = useState<Record<string, string>[]>([]);

    /* ---------------- READ JOBS ---------------- */
    const handleRead = async () => {
        try {
            const { data } = await axios.post('/loadJob', { userId });
            if (!data) return;

            setRecords(data.jobId);
            setJobStatusList(data.jobStatus);
            setJobSeqnumList(data.jobSeqnum);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- SPACE ---------------- */
    const handleCheckSpace = async () => {
        try {
            const { data } = await axios.post('/checkSpace', { username: userId });
            if (typeof data === 'number') setSpace(data);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- DOWNLOAD ---------------- */
    const handleDownload = async (jobId: string) => {
        try {
            const { data } = await axios.post('/download', {
                fileName: jobId,
                fileType: 'upload-files',
                userId,
            });

            if (!data) return;

            const zip = new JSZip();
            data.forEach((f: { name: string; data: string }) => {
                if (f.name !== 'seq_num.txt') zip.file(f.name, f.data);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${jobId}.zip`);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- DELETE ---------------- */
    const handleDelete = async (jobId: string) => {
        if (userId === 'example') {
            Swal.fire('Info', 'You cannot delete the examples!', 'info');
            return;
        }

        try {
            await axios.post('/delete', { fileName: jobId, userId });
            handleRead();
            handleCheckSpace();
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- UNSUBMIT ---------------- */
    const handleShowunsubmit = (jobId: string) => {
        Swal.fire('Unsubmit', `Job ${jobId} is not submitted.`, 'info');
    };


    /* ---------------- SHOW RESULT ---------------- */
    const handleShowResult = async (jobId: string) => {
        setShowOutput(true);
        setIsLoading(true); 
        let resultstatus = 0;
        let statuscount = 0;

        // clear old interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;  
        }

        intervalRef.current = window.setInterval(async () => {
            if (resultstatus < 100) {
                try {
                    const { data } = await axios.post('/readJobstatus', {
                        userId,
                        time: jobId,
                    });

                    if (!data) return;


                    const status = data[0];

                    if (status.includes('inwaiting_')) {
                        Swal.fire('In queue', `There are ${status.split('_')[1]} jobs ahead of JobID:${jobId}. Please wait.`, 'info');
                        clearInterval(intervalRef.current!);
                        return;
                    } else if (status === 'jobnotexists') {
                        Swal.fire('Error', `Job ${jobId} does not exist. Please resubmit.`, 'error');
                        clearInterval(intervalRef.current!);
                        return;
                    } else if (status === 'jobhasnotstart') {
                        Swal.fire('Not started', `Job ${jobId} has not started. Try again later.`, 'info');
                        clearInterval(intervalRef.current!);
                        return;
                    } else if (status === 'nostatus') {
                        statuscount += 1;
                        if (statuscount > 10) {
                            Swal.fire('Error', `Something went wrong with Job ${jobId}. Please refresh.`, 'error');
                            clearInterval(intervalRef.current!);
                            intervalRef.current = null;
                            return;
                        }
                    } else {
                        resultstatus = Number(status.split(':')[1]);
                    }
                } catch (err) {
                    Swal.fire('Error', `Failed to read job status for ${jobId}`, 'error');
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    return;
                }
            }

            // Job completed → fetch result
            if (resultstatus === 100) {
                try {
                    const [modelOptionsResponse, resultsResponse] = await Promise.all([
                        axios.post('/checkoption', { userID: userId, JobID: jobId }),
                        axios.post('/read', { userId, time: jobId })
                    ]);

                    // Set PTM first
                    if (modelOptionsResponse.data) {
                        setPTM(modelOptionsResponse.data);
                    }

                    // Then process and set results
                    const { titles, inputSeqs, titleIndices, resultsArr } =
                        processPTMResult(resultsResponse.data[0], resultsResponse.data[1]);

                    setTitle(titles);
                    setInputs(inputSeqs);
                    setTitleIndex(titleIndices);
                    setResults(resultsArr);
                    setIsLoading(false); 

                } catch {
                    Swal.fire('Error', `No results found for Job ${jobId}`, 'error');
                } finally {
                    clearInterval(intervalRef.current!);
                }
            }
        }, 2000);
    };

    /* ---------------- LIFECYCLE ---------------- */
    useEffect(() => {
        handleCheckSpace();
        handleRead();

        intervalRef.current = window.setInterval(() => {
            handleCheckSpace();
            handleRead();
        }, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (outputRef.current && showOutput) {
            outputRef.current.scrollIntoView({ 
            behavior: 'smooth',  // Smooth scroll animation
            block: 'start'       // Align to top of viewport
            });
        }
        }, [showOutput]); 

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>USER JOB HISTORY</h2>
            <div className={style.history}>
                <h3>Hello! {userId}</h3>
                <h3>You have submitted the following jobs ({space} MB of 100 MB used):</h3>

                <JobHistoryTable
                    records={records}
                    jobStatusList={jobStatusList}
                    jobSeqnumList={jobSeqnumList}
                    handlers={{
                        handleShowResult,
                        handleDownload,
                        handleDelete,
                        handleShowunsubmit,
                    }}
                />
            </div>
            { showOutput && (
                <div ref={outputRef} style={{padding:"30px"}}>
                    <Output title={title}
                        titleindex={titleIndex}
                        input={inputs}
                        results={results}
                        isLoading={isLoading}
                        currentresultstatus="All:100"
                        userId={userId}
                        outputjobId={title}
                        modelOptions={PTM}
                    />
                </div>
            )}
        </div>
    );
};

export default JobHistory;
