import React, { Component } from 'react';
import { type ElementConfig } from 'react';
//import EmojiIcon from '@atlaskit/icon/glyph/emoji';
import $ from 'jquery';
import style from './predict.module.css';
import File from '../../children/file/file.js';
import FileSuccess from '../../children/fileSuccess/fileSuccess.js';
import Jobsubmitted from '../../children/jobsubmitted/jobsubmitted.js';
import IonTextarea from '../../children/textarea/iontextarea.js';
import Down from '../../children/down/down.js'
//import Select, { components } from 'react-select';
import MySelect from "./MySelect.js";
import { IonEnum } from '../../../constants.js';

const modeloptions = [
{ label: 'Phosphorylation (S,T)', value:"Phosphoserine_Phosphothreonine"},
{ label:'Phosphorylation (Y)', value:"Phosphotyrosine"},
{ label:'N-linked glycosylation (N)', value:"N-linked_glycosylation"},
{ label:'O-linked glycosylation (S,T)', value:"O-linked_glycosylation"},
{ label:'Ubiquitination (K)', value:"Ubiquitination"},
{ label:'SUMOylation (K)', value:"SUMOylation"},
{ label:'N6-acetyllysine (K)', value:"N6-acetyllysine"},
{ label:'Methylarginine (R)', value:"Methylarginine"},
{ label:'Methyllysine (K)', value:"Methyllysine"},
{ label:'Pyrrolidone carboxylic acid (Q)', value:"Pyrrolidone_carboxylic_acid"},
{ label:'S-Palmitoylation (C)', value:"S-palmitoyl_cysteine"},
{ label:'Hydroxyproline (P)',value:"Hydroxyproline"},
{ label:'Hydroxylysine (K)',value:"Hydroxylysine"},
{ label:'Zinc (C, H, E, D)',value: IonEnum.ZINC},
{ label:'Copper (C, H) ',value: IonEnum.COPPER},
{ label:'Ferrous (D, E, H)',value: IonEnum.FERROUS}
];

const isIonPred = true;


class IonPredict extends React.Component{

	constructor(props){
		super(props);
		this.state = {
            pasted:true,//默认先展示paste 的输入数据模式
			reversed: false,//默认不展示upload页面
            reversedsubmitted: false,//默认upload的submit是空。
            //modelOptions: null
		}
	}
  
  //changeModel = modelOptions => {
  //this.setState({modelOptions:modelOptions});
  //console.log('Option selected:',modelOptions);
  //}
  
	/*turnToUploadSubmitted = () => {
		this.setState({
            pasted:false,
			reversed: false,
            reversedsubmitted:true
		})
	}*/

	render(){
        
		return (

                    <div className={style.content}>
		  				<h2 style={{'textAlign':'center'}}>Submit your sequence(s)</h2>
                        <div className = {style.options}>
                            <label style={{'textAlign':'left','fontSize':'0.75rem'}}>Please select a prediction model:</label>
                            <div className= {style.select}>
                                      <MySelect isMulti  
                                          options={modeloptions} 
                                          closeMenuOnSelect={true}  
                                          value = {this.props.modelOptions} 
                                          defaultValue={[modeloptions[0]]}  
                                          onChange = {this.props.changeModel}
                                          allowSelectAll={true}
                                          />
                            </div>
 		  				    <div className = {this.props.reversed ? style.predict1 : style.predict2}>									
 		  					    {<IonTextarea pasted = {this.props.pasted}
                                           data = {this.props.data} 
                                           handleExample = {this.props.handleExample} 
                                           changeInput = {this.props.changeInput} 
                                           handleClick = {this.props.handlePredictSeq}  
                                           turnToUpload = {this.props.turnToUpload}/>}
 		  					    <File reversed = {this.props.reversed} onDrop = {this.props.onDrop} turnToInput = {this.props.turnToInput}/>
                                <FileSuccess reversed = {this.props.reversed} recievedfile= {this.props.recievedfile} reversedsubmitted = {this.props.reversedsubmitted} uploadpredict = {this.props.uploadpredict} turnToInput = {this.props.turnToInput} turnToUpload = {this.props.turnToUpload}/> 
 		  				        <Jobsubmitted jobsubmit = {this.props.jobsubmit} 
                                               turnToInput = {this.props.turnToInput} 
                                               turnToUpload = {this.props.turnToUpload} 
                                               jobId = {this.props.jobId} 
                                               userId = {this.props.userId} 
                                               modelOptions = {this.props.modelOptions}/>
                              </div>
		                </div>
                    </div>


		)
	}	
}


export default IonPredict
