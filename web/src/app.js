import React from "react";
import ReactRouter from "./router/Router";
import Footer from './components/super/footer/footer';
import Header from './components/super/header/header';
import './style.css';

function App() {
    const mainStyle = {
        marginTop: "50px"
    };

    return (
        <>
            <Header />
            <main style={mainStyle}>
                <ReactRouter />
            </main>
        </>
    );
}

export default App;
