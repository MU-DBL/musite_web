import React, { Component } from 'react';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import $ from 'jquery';
import style from './ptm.module.css';

const PTMdatamapping = {
  "Phosphoserine_Phosphothreonine.fasta": 'Phosphoserine/Phosphothreonine (S,T)',
  "Phosphotyrosine.fasta": 'Phosphorylation (Y)',
  "N-linked (GlcNAc) asparagine.fasta": 'N-linked glycosylation (N)',
  "O-linked (GlcNAc) serine_O-linked (GlcNAc) threonine.fasta": 'O-linked glycosylation (S,T)',
  "Glycyl lysine isopeptide (Lys-Gly)(interchain with G-Cter in ubiquitin).fasta": 'Ubiquitin (K)',
  "N6-acetyllysine.fasta": 'N6-acetyllysine (K)',
  "N6-methyllysine_N6,N6-dimethyllysine_N6,N6,N6-trimethyllysine.fasta": 'Methylation (K)',
  "Omega-N-methylarginine_Dimethylated arginine_Symmetric dimethylarginine_Asymmetric dimethylarginine.fasta": 'Methylation (R)',
  "S-palmitoyl cysteine.fasta": 'S-Palmitoylation (C)',
  "Pyrrolidone carboxylic acid.fasta": 'Pyrrolidone-carboxylic-acid (Q)',
  "Glycyl lysine isopeptide (Lys-Gly)(interchain with G-Cter in SUMO).fasta": 'SUMOylation (K)',
  "3-hydroxyproline_4-hydroxyproline.fasta": 'Hydroxyproline (P)',
  "4,5-dihydroxylysine_3,4-dihydroxylysine_5-hydroxylysine.fasta": 'Hydroxyproline (K)',
};

class Ptm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ptm: [[]],
      updatetime: "",
    };
  }

  getPTMdisplay = () => {
    $.get('../static/ptm/display.txt', result => {
      const textByLine = result.toString().split("\n");
      const ptm_data = [];
      const updatetime = textByLine[0].split(" ")[1] + "," + textByLine[0].split(" ")[4];

      for (let i = 1; i < textByLine.length; i++) {
        const cols = textByLine[i].split("\t");
        ptm_data.push([cols[0], cols[1], cols[2]]);
      }

      this.setState({ ptm: ptm_data, updatetime });
    });
  }

  handleDownload = e => {
    const title = e.currentTarget.getAttribute('data-file');
    $.ajax({
      type: 'post',
      url: '/download',
      data: { fileName: title, fileType: 'ptm', userId: 'common' },
      success: data => {
        if (data) {
          const zip = new JSZip();
          data.forEach(f => zip.file(f.name, f.data));
          zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, `${PTMdatamapping[title]}.zip`);
          });
        }
      },
      error: (xhr, status, err) => console.error(status, err),
    });
  }

  componentDidMount() {
    this.getPTMdisplay();
  }

  render() {
    const { ptm, updatetime } = this.state;
    return (
      <div>
        <h2 style={{ textAlign: 'center' }}>Annotated sequences for download ({updatetime} release)</h2>
        <div className="page_content">
          <table className="table table-hover table-bordered table-sm">
            <thead className={style.thead}>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>PTM Type</th>
                <th style={{ width: '150px' }}>Proteins</th>
                <th style={{ width: '120px' }}>Sites</th>
              </tr>
            </thead>
            <tbody>
              {ptm.map((e, i) =>
                e[0] ? (
                  <tr key={i}>
                    <td className={style.indexCell}>{i + 1}</td>
                    <td>
                      <span
                        className={style.ptmLink}
                        data-file={e[0]}
                        onClick={this.handleDownload}
                      >
                        {PTMdatamapping[e[0]] || e[0]}
                      </span>
                    </td>
                    <td>{e[1]}</td>
                    <td>{e[2]}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
          <p>
            Click a PTM name to download sequences (FASTA format).
            Amino acids followed by <code>#</code> indicate annotated sites.
          </p>
        </div>
      </div>
    );
  }
}

export default Ptm;
