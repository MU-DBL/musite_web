import React, { Component } from 'react';
import { 
  Route, 
  Routes,
  BrowserRouter
} from 'react-router-dom'; 
import Home from './components/pages/home/home';
import Job from './components/super/job';
import Table3D from './components/super/show3dtable';
import Ptm from './components/pages/ptm/ptm';
import Contact from './components/pages/contact/contact';
import Api from './components/pages/api/api';
import Help from './components/pages/help/help';
import JobHistory from './components/pages/profile/JobHistory';
import Dashboard from './components/pages/analytics/Analytics';

//React的路由，不同规则的path对应不同的组件
const ReactRouter = () => (
  	<Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<JobHistory />} />
        <Route path="/ptm" element={<Ptm />} />
        <Route path="/api" element={<Api />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/job/:UserID/:JobID" element={<Job />} />
        <Route path="/show3dtable/:show3dID" element={<Table3D />} />

        {/*for testing atm*/}
        <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
);

export default ReactRouter;
