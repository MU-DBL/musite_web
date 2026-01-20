import React, { useState } from 'react';
import Select from 'react-select';
import style from './predict.module.css';
import { ionOptions, ModelOption, predictPTMSelectOptions, predictMLSelectOptions, MLOption } from '../../../../constants';
import Swal from 'sweetalert2';
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import PredictIonWithInput from './PredictIonWithInput';
import PredictPTMWithInput from './PredictPTMWithInput';
import PredictPTMWithFile from './PredictPTMWithFile';

type MultiValue<T> = readonly T[];

enum StatusEnum {
  PASTE = 'paste',
  UPLOAD = 'upload',
  FILE_UPLOADED = 'file_uploaded',
  JOB_SUBMITTED = 'job_submitted',
}

const CombinePredict: React.FC = () => {
  const [selectedML, setSelectedML] = useState<MLOption>(predictMLSelectOptions[0]);
  const [selectedPTM, setSelectedPTM] = useState<MultiValue<ModelOption>>([predictPTMSelectOptions[0]]);
  const [selectedIons, setSelectedIons] = useState<MultiValue<ModelOption>>([]);


  const handlePredictMLChange = (newValue: MLOption | null) => {
    if (newValue) {
        setSelectedML(newValue);
    }
  };

  const handlePredictPTM = (newValue: MultiValue<ModelOption> | null) => {
    const selected = newValue || [];
    setSelectedIons(selected.filter(option => ionOptions.includes(option.value))) 

    if (selectedIons.length > 1) {
      Swal.fire({
        icon: "warning",
        title: "Invalid selection",
        text: "For ion binding prediction, you can only select ONE option: Zinc, Copper, or Ferrous.",
        confirmButtonText: "OK",
      });
      return;
    }
    setSelectedPTM(selected);
  };

  return (
    <div className={style.content}>
      <h2 style={{ textAlign: 'center' }}>Submit your sequence(s)</h2>
      <div className={style.options}>
        <label style={{ fontSize: '0.75rem' }}>Please select a prediction machine model:</label>
        <div className={style.select}>
          <Select
            options={predictMLSelectOptions}
            value={selectedML}
            onChange={handlePredictMLChange}
          />
        </div>
        <label style={{ fontSize: '0.75rem' }}>Please select a PTM:</label>
        <div className={style.select}>
          <Select<ModelOption, true>
            options={predictPTMSelectOptions}
            value={selectedPTM}
            onChange={handlePredictPTM}
            isMulti
            closeMenuOnSelect={false}
          />
        </div>
      </div>
      <br />
      <p>For larger job,please upload a FASTA file</p>
      <Tabs defaultActiveKey="Input">
        <Tab eventKey="Input" title="Input">
           {selectedIons.length == 1 ? (
            <PredictIonWithInput ML={selectedML} PTM={selectedPTM} />
          ) : (
            <PredictPTMWithInput ML={selectedML} PTM={selectedPTM} />
          )}
        </Tab>
        <Tab eventKey="File" title="Upload Fasta file">
           {selectedIons.length == 1 ? (
            <p></p>
          ) : (
            <PredictPTMWithFile ML={selectedML} PTM={selectedPTM}></PredictPTMWithFile>
          )}
        </Tab>
      </Tabs>
      {/* <VisualizeIn3DStructure pdbId="1a2b" sites={[45, 78, 102]} /> */}
    </div>
  );
};

export default CombinePredict;
