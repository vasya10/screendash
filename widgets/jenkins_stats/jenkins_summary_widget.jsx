import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';

import BaseWidget from '../widget.jsx';

import './jenkins_summary_widget.scss';
import * as Jenkins from './jenkins_stats_reducers.js';


export default class JenkinsSummaryWidget extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = {title: "init", stats: []};
  }

  render() {
    const statsSummary = Jenkins.statsSummary(this.state.stats)
    return (
      <div className={`jenkins_summary_widget widget ${this.props.customClass || ''}`}>
        <h1><a target="_blank" href="?view=jenkins">{this.props.title}</a></h1>
        <div className="jenkins-container">
          <div className="jenkins-issue-number" title="Total Builds">{statsSummary.buildsCount}</div>
          <div className="flex-container-row">
            <div className="jenkins-pill" title="Repos"><i className="fa fa-database"></i>{statsSummary.reposCount}</div>
            <div className="jenkins-pill" title="Jobs"><i className="fa fa-cog"></i>{statsSummary.jobsCount}</div>
            <div className="jenkins-pill" title="Active Builds"><i className="fa fa-bolt"></i>{statsSummary.activeCount}</div>
            <div className="jenkins-pill" title="Master Score"><i className="fa fa-star-o"></i>{statsSummary.masterScore}%</div>
            {/* <div className="jenkins-pill jenkins-pill__unprioritized" title="No one cares about me"><i className="fa fa-eye-slash"></i>{ji.unprioritized}</div>
            <div className="jenkins-pill jenkins-pill__closed" title="Closed"><i className="fa fa-times-circle-o"></i>{ji.closed}</div> */}
          </div>
        </div>
      </div>
    )
  }
}
