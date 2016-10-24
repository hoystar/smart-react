import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import d3 from "d3";
import { Button } from 'react-bootstrap';
import LayoutGen from './dag/layout/layoutGen';
import { Router, Route, hashHistory } from 'react-router';
import Modelexplore from './pages/model-explore/model-explore';
import './index.css'
const app = document.createElement('div');
app.className = "all-content"
document.body.appendChild(app);

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={Modelexplore}></Route>
    <Route path="model" component={Modelexplore}></Route>
  </Router>
), app);
