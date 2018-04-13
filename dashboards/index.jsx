import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';

import "styles/default.scss";
import "styles/font-awesome/scss/font-awesome.scss";
import "node_modules/react-grid-layout/css/styles.css";
import "node_modules/react-resizable/css/styles.css";
import "node_modules/animate.css/animate.min.css";

import JenkinsView from './jenkins_view';
import SummaryView from './summary_view';
import BuildView from './build_view';

const qs = queryString.parse(location.search);
const DisplayView = qs['view'] === 'build' ? <BuildView /> : qs['view'] === 'jenkins' ? <JenkinsView /> : <SummaryView />;

ReactDOM.render(
  DisplayView,
  document.getElementById('content')
);
