export interface ResultItem {
    [position: string]: string; // position -> score string mapping
  }

export const processPTMResult = (inputStr: string, outputStr: string) => {

    const titles: string[] = [];
    const titleIndices: { label: string; value: number }[] = [];
    const inputSeqs: string[][] = [];
    const outputHash: Record<string, string[]> = {};
    const resultsArr: ResultItem[] = [];

    const inputs = inputStr.split(/[\r\n]+\>/);

    inputs.forEach((seq, idx) => {
      const lines = seq.split(/[\r\n]+/);
      const title = idx === 0 ? lines[0] : ">" + lines[0];
      titles.push(title);
      titleIndices.push({ label: title, value: idx });

      lines.shift();
      if (lines[lines.length - 1] === "") lines.pop();

      const seqArr = lines.join("").split("").filter(ch => ch.charCodeAt(0) !== 13);
      inputSeqs.push(seqArr);
    });

    const outputs = outputStr.split(/[\r\n]+/).filter(line => line !== "");
    let currentId = "";
    for (let i = 1; i < outputs.length; i++) {
      if (outputs[i].startsWith(">")) {
        currentId = outputs[i];
        i++;
      }
      const parts = outputs[i].split("\t");
      // console.log(parts)
      const pos = parts[1];
      const score = parts[3];

      if (!outputHash[currentId]) {
        outputHash[currentId] = [];
      }
      outputHash[currentId].push(`${pos}\t${score}`);
    }

    titles.forEach(id => {
      const res: Record<string, string> = {};
      if (outputHash[id]) {
        outputHash[id].forEach(line => {
          const [pos, score] = line.split("\t");
          res[pos] = score;
        });
      }
      resultsArr.push(res);
    });

    return {
        titles,
        inputSeqs,
        titleIndices,
        resultsArr,
        };
  };
