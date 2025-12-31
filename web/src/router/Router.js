import React, { Component } from 'react';
import { 
  Route, 
  Routes,
  BrowserRouter
} from 'react-router-dom'; 
import Main from '../main';
import Job from '../job';
import Table3D from '../show3dtable';
import Ptm from '../components/super/ptm/ptm';
import Contact from '../components/super/contact/contact';
import Api from '../components/super/api/api';
import Help from '../components/super/help/help';

//React的路由，不同规则的path对应不同的组件
const ReactRouter = () => (
  <BrowserRouter>
  	<Routes>
        <Route path="/" element={<Main />} />
        <Route path="/ptm" element={<Ptm />} />
        <Route path="/api" element={<Api />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/job/:UserID/:JobID" element={<Job />} />
        <Route path="/show3dtable/:show3dID" element={<Table3D />} />
    </Routes>
  </BrowserRouter>
);

export default ReactRouter;
