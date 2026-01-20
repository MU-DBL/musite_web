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
  var jobSubmittedTime: string = "";
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
      jobSubmittedTime = new Date().toISOString();
      

      // Prepare FormData
      const data = new FormData();
      data.append('file', selectedFile); 
      data.append('userId', userId);
      data.append('time', jobSubmittedTime);

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
        setfileSubmitted(true)
        Swal.fire({
          text: "Your job has been submitted successfully!",
          icon: "success",
          confirmButtonText: "Got it!",
        });
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
    let out = 'http://www.musite.net/job/'+ userId+'/'+ jobSubmittedTime 
    window.open(out);
  }

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #888",
          padding: "30px",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <div>
            <img src={img} alt="file icon" width={150} style={{ marginRight: "8px" }} />
            <p>Drop the file here or click to upload (only support the FASTA format).</p>
            <p>Your files and results will be saved on our server for 72 hours. One user is allotted to process up to 5 jobs at the same time.</p>

          </div>
        )}
        <br />
        {uploadedFileName && (
          <div style={{ marginTop: "10px" }}>
            Selected file: {uploadedFileName}, please click "Start Prediction" to submit a predicton job.
          </div>
        )}
      </div>

      <button className={style.submit} onClick={handleUploadPredict}>
        Start Prediction
      </button>
      
      {fileSubmitted && (
       <div>
              <p className = {style.instruction}>Your job (ID: <b>{jobSubmittedTime}</b>) has been submitted, 
              which can be accessed by the following <b>URL</b> or refer to <b>USER JOB HISTORY</b>:<br /><br />
              <a id = "joburl" onClick={handleurl}>http://www.musite.net/job/{userId}/{jobSubmittedTime}</a>
              <br />
              <br />
              <span>((Your files and results will be saved on our server for 72 hours. One user is allotted to process up to 5 jobs at the same time.)</span>
              </p>
            </div>
      )}
    </div>
  );
};

export default PredictPTMWithFile;
