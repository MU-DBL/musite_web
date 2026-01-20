import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import style from "./textarea.module.css";
import { MLOption, ModelOption } from "../../../../constants";
import { useUserId } from "../../../../UserContext";
import Output from "../../common/output/output";
import { processPTMResult } from "../../functions";

interface PredictPTMWithIpuProps {
  ML: MLOption;
  PTM: readonly ModelOption[]; // comes from parent component
}

const PredictPTMWithInput: React.FC<PredictPTMWithIpuProps> = ({ ML, PTM }) => {
  const [data, setData] = useState<string>("");
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResultStatus, setCurrentResultStatus] = useState<string>("Start:0");
  const outputRef = useRef<HTMLDivElement>(null);

  // States for results
  const [inputs, setInputs] = useState<string[][]>([]);
  const [title, setTitle] = useState<string[]>([]);
  const [titleIndex, setTitleIndex] = useState<{ label: string; value: number }[]>([]);
  const [results, setResults] = useState<Record<string, string>[]>([]);

  var jobSubmittedTime: string = "";
  const userId = useUserId();

  /* ---------- Handlers ---------- */

  const handleExample = () => {
    setData(">sp|P97756|KKCC1_RAT Calcium/calmodulin-dependent protein kinase kinase 1 OS=Rattus norvegicus GN=Camkk1 PE=1 SV=1\nMERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASR\nPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTGPASHMSPRAWRRPTIESHHVAISDTE\nDCVQLNQYKLQSEIGKGAYGVVRLAYNEREDRHYAMKVLSKKKLLKQYGFPRRPPPRGSQ\nAPQGGPAKQLLPLERVYQEIAILKKLDHVNVVKLIEVLDDPAEDNLYLVFDLLRKGPVME\nVPCDKPFPEEQARLYLRDIILGLEYLHCQKIVHRDIKPSNLLLGDDGHVKIADFGVSNQF\nEGNDAQLSSTAGTPAFMAPEAISDTGQSFSGKALDVWATGVTLYCFVYGKCPFIDEYILA\nLHRKIKNEAVVFPEEPEVSEELKDLILKMLDKNPETRIGVSDIKLHPWVTKHGEEPLPSE\nEEHCSVVEVTEEEVKNSVKLIPSWTTVILVKSMLRKRSFGNPFEPQARREERSMSAPGNL\nLLKEGCGEGGKSPELPGVQEDEAAS");
  };

  const changeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData(e.target.value);
  };

  const processCheck_Data = (input: string): [string, number] | 0 | 1 => {
    if (!input.startsWith(">")) return 0;

    const sequences = input.split(/[\r\n]+\>/);
    let dataStr = "";
    let aaNum = 0;
    const titleHash: Record<string, boolean> = {};

    sequences.forEach((seq, i) => {
      let lines = seq.split(/[\r\n]+/);
      let title = i === 0 ? lines[0].slice(1) : lines[0];

      if (titleHash[title]) return 1; // duplicate
      titleHash[title] = true;

      lines.shift(); // remove title
      if (lines[lines.length - 1] === "") lines.pop();

      const sequenceStr = lines.join("").replace(/\s+/g, "");
      if (!sequenceStr.match(/^[a-zA-Z-\*]+$/)) return 0;

      aaNum += sequenceStr.length;
      dataStr += `>${title}\n${sequenceStr.toUpperCase()}\n`;
    });

    return [dataStr, aaNum];
  };

 useEffect(() => {
  if (showOutput && outputRef.current) {
    setTimeout(() => {
      outputRef.current!.scrollIntoView({
        behavior: 'smooth',
        block: 'start', // or 'center'
      });
    }, 300);
  }
}, [results, showOutput]);

  const processData = (inputStr: string, outputStr: string) => {
    const {
      titles,
      inputSeqs,
      titleIndices,
      resultsArr,
    } = processPTMResult(inputStr, outputStr);

    setTitle(titles);
    setInputs(inputSeqs);
    setTitleIndex(titleIndices);
    setResults(resultsArr);
    
    setCurrentResultStatus("All:100");
  };

  const handlePredictSeqMain = async () => {
    setShowOutput(true);
    setIsLoading(true); 

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

      processData(res.data[0], res.data[1]);
      setIsLoading(false);
      
    } catch (err) {
      Swal.fire({ title: "Prediction failed!", text: "Network error.", icon: "info" });
    }

    // Polling
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
          setCurrentResultStatus(statusData);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);
  };


  /* ---------- Render ---------- */
  return (
    <div>
      <div>
        <div>
          Paste input FASTA sequence(s):
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
        />
        <div>
          <button className={style.submit} onClick={handlePredictSeqMain}>
            Start prediction
          </button>
        </div>
      </div>
      {showOutput && (
          <div ref={outputRef} style={{ marginTop: "20px" }}>
            <Output title={title}
              titleindex={titleIndex}
              input={inputs}
              results={results}
              isLoading={isLoading}
              currentresultstatus={currentResultStatus}
              userId={userId}
              outputjobId={jobSubmittedTime}
              modelOptions={PTM}
            />
          </div>
        )}
    </div>
  );
};

export default PredictPTMWithInput;
