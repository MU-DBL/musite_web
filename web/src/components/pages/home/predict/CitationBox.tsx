import React from 'react';
import style from "./predict.module.css";

const CITATIONS = [
  {
    id: 1,
    text: 'Wang, D., et al. (2020). MusiteDeep: A Deep-Learning Based Webserver for Protein Post-translational Modification Site Prediction and Visualization.',
    link: 'https://doi.org/10.1093/nar/gkaa275',
  },
  {
    id: 2,
    text: 'Wang, D., et al. (2017). MusiteDeep: a deep-learning framework for general and kinase-specific phosphorylation site prediction.',
    link: 'https://doi.org/10.1093/bioinformatics/btx496',
  },
  {
    id: 3,
    text: 'Wang, D., et al. (2022). Capsule network for protein post-translational modification site prediction.',
    link: 'https://doi.org/10.1093/bioinformatics/btab632',
  },
];

const CitationBox: React.FC = () => (
  <div className={style.citationBox}>
    <h6 className={style.citationTitle}>Citations</h6>
    <div className={style.citationList}>
      {CITATIONS.map((c, i) => (
        <div key={c.id} className={style.citationItem}>
          <span className={style.citationIndex}>[{i + 1}]</span>{" "}
          {c.text}{" "}
          <a
            href={c.link}
            target="_blank"
            rel="noopener noreferrer"
            className={style.citationLink}
          >
            [Link]
          </a>
        </div>
      ))}
    </div>
  </div>
);

export default CitationBox;
