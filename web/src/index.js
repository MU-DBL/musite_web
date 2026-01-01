import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // Add this
import App from './App.js';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>, 
  document.getElementById('root')
);
registerServiceWorker();

if (!window.location.host.startsWith("www")){
    window.location = window.location.protocol + "//" + "www." + window.location.host + window.location.pathname;
}
