import React, { useState } from 'react';
import Select from 'react-select';
import style from './predict.module.css';
import img from './img/upload.png';
import { IonEnum, ionOptions, ionUrl } from '../../../constants';

interface ModelOption {
  label: string;
  value: string;
}

type MultiValue<T> = readonly T[];

const modelOptions: ModelOption[] = [
  { label: 'Phosphorylation (S,T)', value: "Phosphoserine_Phosphothreonine" },
  { label: 'Phosphorylation (Y)', value: "Phosphotyrosine" },
  { label: 'N-linked glycosylation (N)', value: "N-linked_glycosylation" },
  { label: 'O-linked glycosylation (S,T)', value: "O-linked_glycosylation" },
  { label: 'Ubiquitination (K)', value: "Ubiquitination" },
  { label: 'SUMOylation (K)', value: "SUMOylation" },
  { label: 'N6-acetyllysine (K)', value: "N6-acetyllysine" },
  { label: 'Methylarginine (R)', value: "Methylarginine" },
  { label: 'Methyllysine (K)', value: "Methyllysine" },
  { label: 'Pyrrolidone carboxylic acid (Q)', value: "Pyrrolidone_carboxylic_acid" },
  { label: 'S-Palmitoylation (C)', value: "S-palmitoyl_cysteine" },
  { label: 'Hydroxyproline (P)', value: "Hydroxyproline" },
  { label: 'Hydroxylysine (K)', value: "Hydroxylysine" },
  { label: 'Zinc (C, H, E, D)', value: IonEnum.ZINC },
  { label: 'Copper (C, H)', value: IonEnum.COPPER },
  { label: 'Ferrous (D, E, H)', value: IonEnum.FERROUS },
];

enum StatusEnum {
  PASTE = 'paste',
  UPLOAD = 'upload',
  FILE_UPLOADED = 'file_uploaded',
  JOB_SUBMITTED = 'job_submitted',
}

const CombinePredict: React.FC = () => {
  const [selectedModels, setSelectedModels] = useState<MultiValue<ModelOption>>([modelOptions[0]]);
  const [status, setStatus] = useState<StatusEnum>(StatusEnum.PASTE);
  const [data, setData] = useState<string>('');
  const [receivedFile, setReceivedFile] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [userId, setUserId] = useState<string>('user123');

  const handleModelChange = (

    newValue: MultiValue<ModelOption> | null
  ) => {
    var selected = newValue !== null && newValue !== undefined ? newValue : [];
    const selectedIons = selected.filter(option =>
      ionOptions.includes(option.value)
    );

    if (selectedIons.length > 1) {
      return;
    }
    setSelectedModels(selected);
  };

  return (
    <div className={style.content}>
      <h2 style={{ textAlign: 'center' }}>Submit your sequence(s)</h2>
      <div className={style.options}>
        <label style={{ textAlign: 'left', fontSize: '0.75rem' }}>
          Please select a prediction model:
        </label>
        <div className={style.select}>
          <Select<ModelOption, true>
            options={modelOptions}
            value={selectedModels}
            onChange={handleModelChange}
            isMulti
            closeMenuOnSelect={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CombinePredict;
