import React from 'react';
import PropTypes from 'prop-types';
import BaseWidget from '../widget.jsx';
import logger from '.../../logger.js'

import './jira_issues_widget.scss';

export default class JiraIssuesWidget extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = {title: "init", jiraIssues: []};
  }

  componentWillReceiveProps(nextProps) {
    logger.log('info', "componentWillReceiveProps", JSON.stringify(nextProps, undefined, 2))
  }

  render() {
    const ji = this.state.jiraIssues.find(x => x.title === this.props.title)
    return ji ? (
      <div className={`jira_issues_widget widget ${this.props.customClass || ''}`}>
        <h1>{this.props.title}</h1>
        <div className="jira-container">
          <div className="jira-issue-number">{ji.open}</div>
          <div className="flex-container-row">
            <div className="jira-pill jira-pill__open" title="Open"><i className="fa fa-folder-o"></i>{ji.total}</div>
            <div className="jira-pill jira-pill__major" title="Major"><i className="fa fa-arrow-up"></i>{ji.major}</div>
            <div className="jira-pill jira-pill__inprogress" title="In Progress"><i className="fa fa-tasks"></i>{ji.inprogress}</div>
            <div className="jira-pill jira-pill__closed" title="Closed"><i className="fa fa-times-circle-o"></i>{ji.closed}</div>
            <div className="jira-pill jira-pill__unprioritized" title="No one cares about me"><i className="fa fa-eye-slash"></i>{ji.unprioritized}</div>
          </div>
        </div>
      </div>
    ) : null;
  }
}
