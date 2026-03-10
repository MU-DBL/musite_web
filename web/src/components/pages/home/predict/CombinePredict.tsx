import React, { useRef, useEffect, useState } from 'react';
import Select from 'react-select';
import style from './predict.module.css';
import { ionOptions, ModelOption, predictPTMSelectOptions, predictMLSelectOptions, MLOption } from '../../../../constants';
import Swal from 'sweetalert2';
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import PredictIonWithInput from './PredictIonWithInput';
import PredictPTMWithInput, { PTMOutputData } from './PredictPTMWithInput';
import PredictPTMWithFile from './PredictPTMWithFile';
import Output from '../../common/output/output';
import { useUserId } from '../../../../UserContext';
import CitationBox from './CitationBox';

type MultiValue<T> = readonly T[];

const CombinePredict: React.FC = () => {
  const userId = useUserId();
  const [selectedML, setSelectedML] = useState<MLOption>(predictMLSelectOptions[0]);
  const [selectedPTM, setSelectedPTM] = useState<MultiValue<ModelOption>>([]);
  const [selectedIons, setSelectedIons] = useState<MultiValue<ModelOption>>([]);

  // Lifted output state
  const [showOutput, setShowOutput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResultStatus, setCurrentResultStatus] = useState("Start:0");
  const [title, setTitle] = useState<string[]>([]);
  const [titleIndex, setTitleIndex] = useState<{ label: string; value: number }[]>([]);
  const [inputs, setInputs] = useState<string[][]>([]);
  const [results, setResults] = useState<Record<string, string>[]>([]);
  const [outputJobId, setOutputJobId] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showOutput && outputRef.current) {
      setTimeout(() => {
        outputRef.current!.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [results, showOutput]);

  const handlePredictStart = () => {
    setShowOutput(true);
    setIsLoading(true);
    setCurrentResultStatus("Start:0");
  };

  const handleResultReady = (data: PTMOutputData) => {
    setTitle(data.title);
    setTitleIndex(data.titleIndex);
    setInputs(data.inputs);
    setResults(data.results);
    setOutputJobId(data.jobTime);
  };

  const handlePredictMLChange = (newValue: MLOption | null) => {
    if (newValue) setSelectedML(newValue);
  };

  const handlePredictPTM = (newValue: MultiValue<ModelOption> | null) => {
    const selected = newValue || [];
    setSelectedIons(selected.filter(option => ionOptions.includes(option.value)));

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

  const sharedCallbacks = {
    onPredictStart: handlePredictStart,
    onResultReady: handleResultReady,
    onLoadingChange: setIsLoading,
    onStatusUpdate: setCurrentResultStatus,
  };

  return (
    <div className={style.content}>
      <div className={style.layout}>
        <div className={style.leftSection}>
          <h4 className={style.pageTitle}>Submit your sequence(s)</h4>
          <div className={style.options}>
            <div>
              <label className={style.selectLabel}>Select a Prediction Model:</label>
              <div className={style.select}>
                <Select
                  options={predictMLSelectOptions}
                  value={selectedML}
                  onChange={handlePredictMLChange}
                  menuPortalTarget={document.body}
                  menuPosition="absolute"
                  styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
            </div>
            <div>
              <label className={style.selectLabel}>Select Post-translational Modification Type(s):</label>
              <Select<ModelOption, true>
                options={predictPTMSelectOptions}
                value={selectedPTM}
                onChange={handlePredictPTM}
                isMulti
                closeMenuOnSelect={false}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
          </div>
          <div className={style.tabsWrapper}>
            <Tabs defaultActiveKey="Input">
              <Tab eventKey="Input" title="Paste Sequence(s)">
                <div className={style.tabContent}>
                  {selectedIons.length == 1 ? (
                    <PredictIonWithInput ML={selectedML} PTM={selectedPTM} {...sharedCallbacks} />
                  ) : (
                    <PredictPTMWithInput ML={selectedML} PTM={selectedPTM} {...sharedCallbacks} />
                  )}
                </div>
              </Tab>
              <Tab eventKey="File" title="Upload FASTA File">
                <div className={style.tabContent}>
                  {selectedIons.length == 1 ? (
                    <p>File upload is not supported for ion binding prediction.</p>
                  ) : (
                    <div>
                      <p>For larger jobs, upload a FASTA file instead of pasting.</p>
                      <PredictPTMWithFile ML={selectedML} PTM={selectedPTM} />
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
        <div className={style.rightSection}>
          <CitationBox />
        </div>
      </div>
      {showOutput && (
        <div ref={outputRef} className={style.outputSection}>
          <Output
            title={title}
            titleindex={titleIndex}
            input={inputs}
            results={results}
            isLoading={isLoading}
            currentresultstatus={currentResultStatus}
            userId={userId}
            outputjobId={outputJobId}
            modelOptions={selectedPTM}
          />
        </div>
      )}
    </div>
  );
};

export default CombinePredict;
