import './App.css';
import { getChartContext, ChartModel, ChartConfig, ColumnType, CustomChartContext, Query, ChartToTSEvent, DataType, VisualProps } from '@thoughtspot/ts-chart-sdk';
import React, { useRef } from 'react';
import _ from 'lodash';
import * as THREE from 'three';
import { useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes
} from "react-router-dom";
import BodyMap from './charts/body_map';
import CirclePacking from './charts/circle_packing';

export default function App() {
  return (
    // <Router>
    //         <Routes>
    //       <Route path="/body_map"
    //       element={ <BodyMap />}
    //       />
    //       <Route path="/circle_packing"
    //        element={ <CirclePacking />}
    //       />
    //       <Route path="/" 
    //           element={<div>
    //             A collection of charts
    //             <a href="/body_map">body map</a>
    //             <a href="/circle_packing">circle packing</a>
    //           </div>}
    //       />
    //     </Routes>
    // </Router>
    <BodyMap/>
  );
}


