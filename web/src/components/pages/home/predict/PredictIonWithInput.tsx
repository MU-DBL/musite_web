import React, { useState } from "react";
import style from "./textarea.module.css";
import { MLOption, ModelOption, getIonUrl } from "../../../../constants";
import axios from 'axios';
import Swal from 'sweetalert2';
import { useUserId } from "../../../../UserContext";
import { PTMOutputData } from "./PredictPTMWithInput";

interface PredictIonWithInputProps {
  ML: MLOption;
  PTM: readonly ModelOption[];
  onPredictStart: () => void;
  onResultReady: (data: PTMOutputData) => void;
  onLoadingChange: (loading: boolean) => void;
  onStatusUpdate: (status: string) => void;
}

const PredictIonWithInput: React.FC<PredictIonWithInputProps> = ({
  PTM, onPredictStart, onResultReady, onLoadingChange,
}) => {
  const userId = useUserId();
  const [data, setData] = useState<string>("");

  const handleExample = () => setData("1A5T_A");
  const changeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData(e.target.value);

  const processIonPredictData = (output: string, jobTime: string) => {
    let lines = output.split(/[\r\n]+/).filter(line => line.trim() !== "");
    if (lines.length < 2) return;

    const firstLine = lines[1].split("\t");
    const key = firstLine[0];
    let seq = firstLine[1].split("").filter(ch => ch !== " " && ch.charCodeAt(0) !== 13);

    const newTitle = [key];
    const newTitleIndex = [{ label: key, value: 0 }];
    const outputHash: Record<string, string[]> = {};

    for (let i = 2; i < lines.length; i++) {
      const parts = lines[i].split("\t");
      const pos = parts[1];
      const score = parts[3];
      if (outputHash[key]) {
        outputHash[key].push(pos + "\t" + score);
      } else {
        outputHash[key] = [pos + "\t" + score];
      }
    }

    const newResults: Record<string, string>[] = [{}];
    if (outputHash[key]) {
      for (const entry of outputHash[key]) {
        const [pos, score] = entry.split("\t");
        newResults[0][pos] = score;
      }
    }

    onResultReady({
      title: newTitle,
      titleIndex: newTitleIndex,
      inputs: [seq],
      results: newResults,
      jobTime,
    });
    onLoadingChange(false);
  };

  const handleClick = async () => {
    if (!PTM.length) {
      Swal.fire({ text: "Please select at least one valid ion model!", icon: "info", confirmButtonText: "Got it!" });
      return;
    }

    const residuesName: Record<string, string> = {
      Zinc: 'ZN', Copper: 'CU', Ferrous: 'FE2',
      Calcium: 'CA', Magnesium: 'MG', Manganese: 'MN',
      Sodium: 'NA', Potassium: 'K',
    };

    const ion = residuesName[PTM[0].value as keyof typeof residuesName];
    const jobTime = new Date().toISOString();

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('time', jobTime);
    formData.append('pdbId', data);
    formData.append('ion', ion);
    formData.append('cutoff', '0.5');

    onPredictStart();

    try {
      const response = await axios.post(`${getIonUrl()}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      processIonPredictData(response.data, jobTime);
    } catch (error) {
      console.error('Prediction error:', error);
      Swal.fire({ title: 'Prediction failed!', text: 'Please try again later.', icon: 'info', confirmButtonText: 'Got it!' });
    }
  };

  return (
    <div>
      <div className={style.inputLabel}>
        <span>Type a PDB ID in the area below:</span>
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
        className={style.pdbTextarea}
      />
      <div>
        <button className={style.submit} onClick={handleClick}>
          Start prediction
        </button>
      </div>
    </div>
  );
};

export default PredictIonWithInput;
