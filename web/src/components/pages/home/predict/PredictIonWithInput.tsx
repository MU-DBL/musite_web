import React, { useEffect, useRef, useState } from "react";
import style from "./textarea.module.css";
import { MLOption, ModelOption, PTMType, getIonUrl } from "../../../../constants";
import axios from 'axios';
import Swal from 'sweetalert2';
import { useUserId } from "../../../../UserContext";
import Output from "../../common/output/output";
import { ProgressBar } from "react-bootstrap";

interface PredictIonWithInputProps {
  ML: MLOption;
  PTM: readonly ModelOption[];
}

const PredictIonWithInput: React.FC<PredictIonWithInputProps> = ({ ML, PTM }) => {
  const [data, setData] = useState<string>("");
  const [showOutput, setShowOutput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userId = useUserId();
  var jobSubmittedTime: string = "";

  // States for results
  const [title, setTitle] = useState<string[]>([]);
  const [titleIndex, setTitleIndex] = useState<{ label: string; value: number }[]>([]);
  const [input, setInput] = useState<string[][]>([]);
  const [results, setResults] = useState<Record<string, string>[]>([]);
  const [currentResultStatus, setCurrentResultStatus] = useState<string>("Start:0");
  const outputRef = useRef<HTMLDivElement>(null);


  const handleExample = () => {
    setData("1A5T_A");
  };

  const changeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData(e.target.value);
  };

  const processIonPredictData = (output: string) => {
    let lines = output.split(/[\r\n]+/).filter(line => line.trim() !== "");
    if (lines.length < 2) return;

    let tmp: string[][] = [];
    let outputHash: Record<string, string[]> = {};
    let lastShow = "";

    // parse first pdb line
    const firstLine = lines[1].split("\t");
    const key = firstLine[0];
    let seq = firstLine[1].split("").filter(ch => ch !== " " && ch.charCodeAt(0) !== 13);

    tmp.push(seq);

    const newTitle = [key];
    const newTitleIndex = [{ label: key, value: 0 }];

    // parse the rest of the output
    for (let i = 2; i < lines.length; i++) {
      const parts = lines[i].split("\t");
      const pos = parts[1];
      lastShow = parts[3];
      if (outputHash[key]) {
        outputHash[key].push(pos + "\t" + lastShow);
      } else {
        outputHash[key] = [pos + "\t" + lastShow];
      }
    }

    // build results
    const newResults: Record<string, string>[] = [{}];
    for (let i = 0; i < newTitle.length; i++) {
      const k = newTitle[i];
      if (outputHash[k]) {
        for (let j = 0; j < outputHash[k].length; j++) {
          const [pos, score] = outputHash[k][j].split("\t");
          newResults[i][pos] = score;
        }
      }
    }
    // update state
    setTitle(newTitle);
    setTitleIndex(newTitleIndex);
    setInput(tmp);
    setResults(newResults);
    setCurrentResultStatus("All:100");
  };

  const handleClick = async () => {
    setShowOutput(true)
    setIsLoading(true)
    
    if (!PTM.length) {
      Swal.fire({
        text: "Please select at least one valid ion model!",
        icon: "info",
        confirmButtonText: "Got it!",
      });
      return;
    }

    const residuesName: Record<string, string> = {
      Zinc: 'ZN',
      Copper: 'CU',
      Ferrous: 'FE2',
      Calcium: 'CA',
      Magnesium: 'MG',
      Manganese: 'MN',
      Sodium: 'NA',
      Potassium: 'K',
    };

    const ion = residuesName[PTM[0].value as keyof typeof residuesName];
    jobSubmittedTime = new Date().toISOString();

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('time', jobSubmittedTime);
    formData.append('pdbId', data);
    formData.append('ion', ion);
    formData.append('cutoff', '0.5');

    try {

      const response = await axios.post(`${getIonUrl()}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      processIonPredictData(response.data);
      setIsLoading(false)
    } catch (error) {
      console.error('Prediction error:', error);
      Swal.fire({
        title: 'Prediction failed!',
        text: 'Please try again later.',
        icon: 'info',
        confirmButtonText: 'Got it!',
      });
    }
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

  return (
    <div>
      <div>
        <div>
          Type a PDB ID in the area below:
          <button className={style.example} onClick={handleExample}>
            Load example PDB ID
          </button>
        </div>

        <textarea
          autoFocus
          spellCheck={false}
          value={data}
          placeholder="PDB ID"
          onChange={changeInput}
        />

        <div className={style.buttonin}>
          <button className={style.submit} onClick={handleClick}>
            Start prediction
          </button>
        </div>
      </div>
      <div ref={outputRef} style={{ marginTop: "20px" }}>
        {showOutput && (
          <div>
            <Output title={title}
              titleindex={titleIndex}
              input={input}
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
    </div>
  );
};

export default PredictIonWithInput;
