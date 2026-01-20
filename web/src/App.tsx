import React, { useState, useEffect } from "react";
import ReactRouter from "./Router";
import Header from "./components/pages/common/header/header";
import './style.css';
import { UserContext } from './UserContext';

function App() {
  const mainStyle = {
    marginTop: "50px"
  };

  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("userIdMusiteDeep");
    if (stored) {
      setUserId(stored);
    } else {
      const newId =
        new Date().toISOString() +
        Number(Math.random().toString().slice(2)).toString(36);
      localStorage.setItem("userIdMusiteDeep", newId);
      setUserId(newId);
    }
  }, []);

  if (!userId) return null; // wait until userId is ready

  return (
    <UserContext.Provider value={userId}>
      <Header />
      <main style={mainStyle}>
        <ReactRouter />
      </main>
    </UserContext.Provider>
  );
}

export default App;
