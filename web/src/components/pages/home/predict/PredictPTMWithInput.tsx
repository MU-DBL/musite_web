import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import style from "./textarea.module.css";
import { MLOption, ModelOption } from "../../../../constants";
import { processPTMResult } from "../../functions";

export interface PTMOutputData {
  title: string[];
  titleIndex: { label: string; value: number }[];
  inputs: string[][];
  results: Record<string, string>[];
  jobTime: string;
}

interface PredictPTMWithInputProps {
  ML: MLOption;
  PTM: readonly ModelOption[];
  onPredictStart: () => void;
  onResultReady: (data: PTMOutputData) => void;
  onLoadingChange: (loading: boolean) => void;
  onStatusUpdate: (status: string) => void;
}

const PredictPTMWithInput: React.FC<PredictPTMWithInputProps> = ({
  PTM, onPredictStart, onResultReady, onLoadingChange, onStatusUpdate,
}) => {
  const [data, setData] = useState<string>("");

  const handleExample = () => {
    setData(">sp|P97756|KKCC1_RAT Calcium/calmodulin-dependent protein kinase kinase 1 OS=Rattus norvegicus GN=Camkk1 PE=1 SV=1\nMERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASR\nPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTGPASHMSPRAWRRPTIESHHVAISDTE\nDCVQLNQYKLQSEIGKGAYGVVRLAYNEREDRHYAMKVLSKKKLLKQYGFPRRPPPRGSQ\nAPQGGPAKQLLPLERVYQEIAILKKLDHVNVVKLIEVLDDPAEDNLYLVFDLLRKGPVME\nVPCDKPFPEEQARLYLRDIILGLEYLHCQKIVHRDIKPSNLLLGDDGHVKIADFGVSNQF\nEGNDAQLSSTAGTPAFMAPEAISDTGQSFSGKALDVWATGVTLYCFVYGKCPFIDEYILA\nLHRKIKNEAVVFPEEPEVSEELKDLILKMLDKNPETRIGVSDIKLHPWVTKHGEEPLPSE\nEEHCSVVEVTEEEVKNSVKLIPSWTTVILVKSMLRKRSFGNPFEPQARREERSMSAPGNL\nLLKEGCGEGGKSPELPGVQEDEAAS");
  };

  const changeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData(e.target.value);

  const processCheck_Data = (input: string): [string, number] | 0 | 1 => {
    if (!input.startsWith(">")) return 0;

    const sequences = input.split(/[\r\n]+\>/);
    let dataStr = "";
    let aaNum = 0;
    const titleHash: Record<string, boolean> = {};

    sequences.forEach((seq, i) => {
      let lines = seq.split(/[\r\n]+/);
      let title = i === 0 ? lines[0].slice(1) : lines[0];

      if (titleHash[title]) return 1;
      titleHash[title] = true;

      lines.shift();
      if (lines[lines.length - 1] === "") lines.pop();

      const sequenceStr = lines.join("").replace(/\s+/g, "");
      if (!sequenceStr.match(/^[a-zA-Z-\*]+$/)) return 0;

      aaNum += sequenceStr.length;
      dataStr += `>${title}\n${sequenceStr.toUpperCase()}\n`;
    });

    return [dataStr, aaNum];
  };

  const handlePredictSeqMain = async () => {
    if (!PTM.length) {
      Swal.fire({ text: "Please select at least one PTM model!", icon: "info" });
      return;
    }

    if (!data.startsWith(">")) {
      Swal.fire({
        title: "Invalid FASTA format",
        text: "The first line must start with '>' and only alphabet, *, -, space, and line breaks are accepted.",
        icon: "info",
      });
      return;
    }

    const len = data.split(/[\r\n]+\>/).length;
    const fasta = processCheck_Data(data);

    if (fasta === 0 || fasta === 1) {
      Swal.fire({
        title: fasta === 0 ? "Invalid FASTA format" : "Duplicate protein IDs found",
        icon: "info",
      });
      return;
    }

    if ((fasta as [string, number])[1] > 5000 || len > 10) {
      Swal.fire({
        title: "Input sequences reach the limitation!",
        text: `10 sequences or 5000 residues at most. You submitted ${len} sequences.`,
        icon: "info",
      });
      return;
    }

    const time = new Date().toISOString();
    onPredictStart();

    try {
      const res = await axios.post("/cmd", {
        input: (fasta as [string, number])[0],
        model: PTM,
        userId: localStorage.getItem("userIdMusiteDeep"),
        time,
        seqNum: len,
      });

      if (res.data === "error") {
        Swal.fire({ title: "Prediction failed!", text: "Please try again later.", icon: "info" });
        return;
      }

      const { titles, inputSeqs, titleIndices, resultsArr } = processPTMResult(res.data[0], res.data[1]);
      onResultReady({ title: titles, titleIndex: titleIndices, inputs: inputSeqs, results: resultsArr, jobTime: time });
      onLoadingChange(false);
    } catch (err) {
      Swal.fire({ title: "Prediction failed!", text: "Network error.", icon: "info" });
    }

    let resultStatus = 0;
    const interval = setInterval(async () => {
      if (resultStatus >= 100) {
        clearInterval(interval);
        return;
      }
      try {
        const statusRes = await axios.post("/readcmdstatus", {
          input: fasta,
          userId: localStorage.getItem("userIdMusiteDeep"),
          time,
        });
        const statusData = statusRes.data;
        if (typeof statusData === "string" && statusData.includes(":")) {
          resultStatus = Number(statusData.split(":")[1]);
          onStatusUpdate(statusData);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);
  };

  return (
    <div>
      <div className={style.inputLabel}>
        <span>Paste input FASTA sequence(s):</span>
        <button className={style.example} onClick={handleExample}>
          Load example FASTA
        </button>
      </div>
      <textarea
        autoFocus
        spellCheck={false}
        value={data}
        placeholder=">sp..."
        onChange={changeInput}
        className={style.pdbTextarea}
      />
      <div>
        <button className={style.submit} onClick={handlePredictSeqMain}>
          Start prediction
        </button>
      </div>
    </div>
  );
};

export default PredictPTMWithInput;
