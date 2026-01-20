import React, { useRef } from "react";
import Summary from "./summary/summary";
import Footer from "./footer/footer";
import CombinePredict from "./predict/CombinePredict";
const Home: React.FC = () => {

  return (
      <div>
        <Summary />
        <CombinePredict />
        <Footer />
      </div>
  );
};

export default Home;
