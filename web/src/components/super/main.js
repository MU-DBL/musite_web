import React, { Component } from 'react';
import swal from 'sweetalert';
import $ from 'jquery';
import Warning from './warning/warning';
import Verify from './verify/verify';
// import Predict from './components/super/predict/predict';
import Output from '../pages/output/output';
import './main.module.css';
import style from './main.module.css';
import { IonEnum } from '../../constants';
// import IonPredict from './components/super/predict/ionpredict';
import Summary from '../pages/home/summary/summary';
import CombinePredict from './components/super/predict/CombinePredict';

const ionOptions = [IonEnum.ZINC, IonEnum.COPPER, IonEnum.FERROUS];
const ionUrl = document.location.protocol + "//" + document.location.hostname + ":5004/ionpred_api";
console.log(ionUrl)

class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showProfile: false,
      showOutput: false,
      showProOutput: false,//profile 的output 
      data: "",
      processeddata: "",//data after preprocessing
      time: "",
      modelOptions: [{ label: "Phosphorylation (S,T)", value: "Phosphoserine_Phosphothreonine" }], //default one 如果不想要，就设为null
      profilemodelOptions: null, //只当想show profile时用这个option。
      //originalInput: '', //download 如果很大会有压力，所以先不要存input
      //originalResults: '',
      title: [],
      titleindex: [],
      input: [[]],
      uploadcontent: "",//不直接upload了，只把变量保存。
      uploadSeqNum: 0,
      results: [{}],
      outputjobId: "", //output显示的job上面显示一个id。一次output只能有一次有效的id
      space: 0,
      userId: '',
      currentresultstatus: "Start:0", //一次只能显示一个results，这个用于记录upload file的结果情况。 不只是upload file copy seq 也用这个。
      currentjob: '', //一个用户可以有list of jobs，但是一次show只能显示最后一个，否则就乱了！用currentjob记录用户的最后要show的目录，就是time

      showPredict: true, //展示用户输入框。
      pasted: true, //pasted mode
      reversed: false,
      reversedsubmitted: false,
      jobsubmit: false,
      recievedfile: "",
    }

    console.log("in constructor")
  }

  getIP = () => {
    $.ajax(
      {
        type: 'post',
        url: '/location_IP',
        data: {
          'userId': this.state.userId,
        },
        success: data => {
          console.log(data)
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(XMLHttpRequest.status);
          console.log(XMLHttpRequest.readyState);
          console.log(textStatus);
        }
      }
    )
  }

  componentDidMount = () => {
    console.log("in didmount")
    window.scrollTo(0, 0);
    //setTimeout(() => window.scrollTo(0, this.refs.main.offsetTop), 5000);
    if (localStorage.getItem('userIdMusiteDeep')) {
      this.setState({
        userId: localStorage.getItem('userIdMusiteDeep')
      });
    }
    this.getIP();
    console.log("localStorage is " + localStorage.getItem('userIdMusiteDeep'));
    if (!localStorage.getItem('userIdMusiteDeep')) {
      this.setUserId();
      console.log("setUserId to ");
    }
    this.justshowit();
    //console.log('userId in main.js is '+ this.state.userId)
  }

  render() {
    //console.log("current userId is "+ this.state.userId)
    //console.log(this.state.showProfile)
    //console.log(this.state.showProOutput)
    //console.log(this.state.showPredict)
    //console.log(this.state.showOutput)
    let showresult = false;
    if (this.state.showProfile && this.state.showProOutput) {
      showresult = true;
    }
    if (this.state.showOutput && this.state.showPredict) {
      showresult = true;
    }

    const selectedRestricted = (this.state.modelOptions && this.state.modelOptions.filter(option => ionOptions.includes(option.value))) || [];

    let showIonPredict = false;
    if (selectedRestricted.length > 0) {
      showIonPredict = true;
    }
    else {
      showIonPredict = false;
    }

    // console.log(showIonPredict)

    return (
      <div className={style.main}>
        <Summary></Summary>
        <main ref="main" className={showresult ? style.large : style.small}>
          {/* <div className ={this.state.showProfile? style.profile:style.profileHide}>
                    <Profile userId = {this.state.userId} 
                             space = {this.state.space} 
                             changeSpace = {this.changeSpace}
                             showProfile = {this.state.showProfile}
                             handleShowResult = {this.handleShowResult} 
                  />
                  
                </div> */}
                <CombinePredict></CombinePredict>
          {/* <div className={this.state.showPredict ? style.predict : style.predictHide}>
            
             {showIonPredict ? (
              <>
                <IonPredict space={this.state.space}
                  data={this.state.data}
                  processData={this.processData}
                  changeModel={this.changeModel}
                  changeInput={this.changeInput}
                  handleExample={this.handleIonExample}
                  handlePredictSeq={this.handleIonPredictSeqmain}
                  uploadpredict={this.handleuploadpredict}
                  onDrop={this.onDrop}
                  recievedfile={this.state.recievedfile}
                  turnToUpload={this.turnToUpload}
                  turnToInput={this.turnToInput}
                  pasted={this.state.pasted}
                  reversed={this.state.reversed}
                  reversedsubmitted={this.state.reversedsubmitted}
                  jobsubmit={this.state.jobsubmit}
                  jobId={this.state.time}
                  uploadcontent={this.state.uploadcontent}
                  userId={this.state.userId}
                  modelOptions={this.state.modelOptions}
                  handleShowOutput={this.handleShowOutput} />
              </>
            ) : (
              <>
                <Predict space={this.state.space}
                  data={this.state.data}
                  processData={this.processData}
                  changeModel={this.changeModel}
                  changeInput={this.changeInput}
                  handleExample={this.handleExample}
                  handlePredictSeq={this.handlePredictSeqmain}
                  uploadpredict={this.handleuploadpredict}
                  onDrop={this.onDrop}
                  recievedfile={this.state.recievedfile}
                  turnToUpload={this.turnToUpload}
                  turnToInput={this.turnToInput}
                  pasted={this.state.pasted}
                  reversed={this.state.reversed}
                  reversedsubmitted={this.state.reversedsubmitted}
                  jobsubmit={this.state.jobsubmit}
                  jobId={this.state.time}
                  uploadcontent={this.state.uploadcontent}
                  userId={this.state.userId}
                  modelOptions={this.state.modelOptions}
                  handleShowOutput={this.handleShowOutput} />
              </>
            )}
          </div> */}
          {/* <div className={showresult ? style.result : style.resultHide}>
            <Output title={this.state.title}
              titleindex={this.state.titleindex}
              input={this.state.input}
              results={this.state.results}
              currentresultstatus={this.state.currentresultstatus}
              userId={this.state.userId}
              outputjobId={this.state.outputjobId}
              modelOptions={this.state.showProfile ? this.state.profilemodelOptions : this.state.modelOptions}
            />
            <div className={style.ptmannotation}>
              <ul>
                <li>Phosphorylation:  <span style={{ fontWeight: '700', color: 'Blue' }}>P</span></li>
                <li>Glycosylation:  <span style={{ fontWeight: '700', color: 'Red' }}>gl</span></li>
                <li>Ubiquitination:  <span style={{ fontWeight: '700', color: 'Gray' }}>ub</span></li>
                <li>SUMOylation:  <span style={{ fontWeight: '700', color: 'Olive' }}>su</span></li>
                <li>Acetylation:  <span style={{ fontWeight: '700', color: 'Orange' }}>ac</span></li>
                <li>Methylation:  <span style={{ fontWeight: '700', color: 'Black' }}>me</span></li>
                <li>Pyrrolidone carboxylic acid:  <span style={{ fontWeight: '700', color: 'Purple' }}>pc</span></li>
                <li>Palmitoylation:  <span style={{ fontWeight: '700', color: 'Maroon' }}>pa</span></li>
                <li>Hydroxylation:  <span style={{ fontWeight: '700', color: 'Green' }}>Hy</span></li>
                <li>Zinc:  <span style={{ fontWeight: '700', color: 'Teal' }}>z</span></li>
                <li>Copper:  <span style={{ fontWeight: '700', color: 'Fuchsia' }}>c</span></li>
                <li>Ferrous:  <span style={{ fontWeight: '700', color: 'Indianred' }}>fe</span></li>
              </ul>
            </div>
          </div> */}
        </main>
      </div>
    );
  }
}

export default Main
