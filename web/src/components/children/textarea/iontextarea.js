import React, { Component } from 'react';
import $ from 'jquery';
import style from './textarea.module.css';

class IonTextarea extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div className={this.props.pasted ? style.textareaOn : style.textarea}>
        <div className={style.holder}>
          <div className={style.instruction}>
          Type a PDB ID in the area below:<button className={style.example} onClick={this.props.handleExample}>Load example PDB ID</button>
          </div>
          <textarea
            autoFocus
            spellCheck="false"
            value={this.props.data}
            placeholder="PDB ID"
            onChange={this.props.changeInput}
          ></textarea>
          <div className={style.instructionupload}>
            For larger job, <button disabled className={style.example} onClick={this.props.turnToUpload}>upload a FASTA file</button>
          </div> 
          <div>
            <div className={style.buttonin}>
              <button className={style.submit} onClick={this.props.handleClick}>Start prediction</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


export default IonTextarea