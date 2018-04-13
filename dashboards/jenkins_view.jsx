import React from 'react';
import ReactDOM from 'react-dom';

import RGL, { WidthProvider } from 'react-grid-layout';

import JenkinsStatsWidget from 'widgets/jenkins_stats/jenkins_stats_widget';

const ReactGridLayout = WidthProvider(RGL);
var layout = [
  {i: 'jenkins_stats', x: 0, y: 0, w: 4, h: 2, minW: 4}
];


export default class JenkinsView extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ReactGridLayout className="layout" cols={4} layout={layout}>
        <div key="jenkins_stats"><JenkinsStatsWidget name="jenkins_stats" title="Jenkins" /></div>
      </ReactGridLayout>
    );
  }
}
