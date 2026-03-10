import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import style from "./textarea.module.css";
import { MLOption, ModelOption } from "../../../../constants";
import { useDropzone } from "react-dropzone";
import img from "./upload.png";
import { useUserId } from "../../../../UserContext";

interface PredictPTMWithIpuProps {
  ML: MLOption;
  PTM: readonly ModelOption[];
}

const PredictPTMWithFile: React.FC<PredictPTMWithIpuProps> = ({ ML, PTM }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [fileSubmitted, setfileSubmitted] = useState<boolean>(false);

  const userId = useUserId();
  const [jobSubmittedTime, setJobSubmittedTime] = useState<string>("");
  // Dropzone hook
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { ".fasta": [] }, // only allow .fasta files
    multiple: false,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const selectedFile = acceptedFiles[0];

      // File size check (max 5MB)
      const sizeMB = selectedFile.size / (1024 * 1024);
      if (sizeMB > 5) {
        Swal.fire({
          text: "Please upload a smaller file, 5MB per job at most.",
          icon: "info",
          confirmButtonText: "Got it!",
        });
        return;
      }

      // Set time for the current job
      const currentJobTime = new Date().toISOString();
      setJobSubmittedTime(currentJobTime);

      // Prepare FormData
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('userId', userId);
      data.append('time', currentJobTime);

      // Upload file using axios
      axios.post('/uploadcheck', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then(response => {
          const data = response.data;

          if (!data.fasta) {
            Swal.fire({
              title: "Invalid FASTA format",
              text: "Please upload sequences with the correct FASTA format! The first line must be started with > and only alphabet, *, -, space, and line breaks are accepted.",
              icon: "info",
              confirmButtonText: "Got it!"
            });
            return;
          }

          if (data.duplicate) {
            Swal.fire({
              text: "Duplicate protein IDs are found in your input data, please check!",
              icon: "info",
              confirmButtonText: "Got it!"
            });
            return;
          }

          if (!data.success) {
            Swal.fire({
              title: "Upload file failed!",
              text: "Please try again later!",
              icon: "info",
              confirmButtonText: "Got it!"
            });
            return;
          }
          console.log("Upload success!");
          setFile(selectedFile);
          setUploadedFileName(selectedFile.name);

        })
        .catch(error => {
          Swal.fire({
            title: "Upload file failed, please try again later!",
            icon: "error",
            confirmButtonText: "Got it!"
          });
          console.error('Upload error:', error);
        });
    },
  });


  // Submit file to backend
  const handleUploadPredict = async () => {
    if (!file) {
      Swal.fire({
        text: "Please upload a file first!",
        icon: "info",
        confirmButtonText: "Got it!",
      });
      return;
    }

    if (!PTM.length) {
      Swal.fire({
        text: "Please select at least one PTM model!",
        icon: "info",
        confirmButtonText: "Got it!",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", userId); // replace with actual user ID
      formData.append("time", jobSubmittedTime);
      formData.append("modelOptions", JSON.stringify({ models: PTM }));
      formData.append("file", uploadedFileName);

      const response = await axios.post("/uploadpredict", formData);

      const data = response.data;
      if (data === "amountError") {
        Swal.fire({
          text: "Please wait for your previous files’ processing! (One user is allotted up to 5 jobs simultaneously.)",
          icon: "info",
          confirmButtonText: "Got it!",
        });
      } else if (data === "submitted") {
        setfileSubmitted(true);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 50);
        // Swal.fire({
        //   text: "Your job has been submitted successfully!",
        //   icon: "success",
        //   confirmButtonText: "Got it!",
        // });
      } else {
        Swal.fire({
          text: data,
          icon: "info",
          confirmButtonText: "Got it!",
        });
      }
    } catch (error) {
      console.error("Upload prediction error:", error);
      Swal.fire({
        title: "Upload failed!",
        text: "Please try again later.",
        icon: "error",
        confirmButtonText: "Got it!",
      });
    }
  };

  const handleurl = () => {
    let out = window.location.origin + '/job/' + userId + '/' + jobSubmittedTime
    window.open(out);
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={isDragActive ? `${style.dropzone} ${style.dropzoneActive}` : style.dropzone}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className={style.dropzoneDrag}>Drop the file here ...</p>
        ) : (
          <div>
            <img src={img} alt="file icon" className={style.dropzoneIcon} />
            <p className={style.dropzoneText}>Drop the file here or click to upload (only .fasta format supported).</p>
            <p className={style.dropzoneSubText}>Files and results are saved on our server for 72 hours. Up to 5 jobs at the same time per user.</p>
          </div>
        )}
        {uploadedFileName && (
          <div className={style.fileSelected}>
            Selected: <b>{uploadedFileName}</b> &mdash; click "Start Prediction" to submit.
          </div>
        )}
      </div>
      <div>
        <button className={style.submit} onClick={handleUploadPredict}>
          Start Prediction
        </button>
      </div>
      {fileSubmitted && (
        <div className={style.jobSubmittedCard}>
          <p className={style.jobSubmittedTitle}>
            Your job (ID: <b>{jobSubmittedTime}</b>) has been submitted successfully.
            Access it via the URL below or check <b>Job History</b>:
          </p>
          <div className={style.jobSubmittedUrl}>
            <a onClick={handleurl}>
              {window.location.origin}/job/{userId}/{jobSubmittedTime}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictPTMWithFile;
