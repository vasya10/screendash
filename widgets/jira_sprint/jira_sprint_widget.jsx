import React from 'react';
import moment from 'moment';

import BaseWidget from '../widget.jsx';

import '../jira_issues/jira_issues_widget.scss';
import './jira_sprint_widget.scss';


/* date is in format dd/MM/YY-dd/MM/YY */
const closesIn = (date)  => {
  if (!date) return ''
  const endDate = date.split('-')[1]
  return moment(endDate + ":23:59:59", 'MM/DD/YY:HH:mm:ss').fromNow()
}

export default class JiraSprintWidget extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = {title: "Sprint", jiraIssues: [ { total: 0, open: 0, major: 0, inprogress: 0, closed: 0 } ], sprint: {} };
  }

  render() {
    return  (
      <div className={`jira_sprint_widget widget ${this.props.customClass || ''}`}>
        <h1>{this.state.sprint.name}</h1>
        <div className="jira-container">
          <div className="jira-issue-number">{this.state.jiraIssues[0].open}</div>
          <div className="jira-issue-subtext">Closes {closesIn(this.state.sprint.date)}</div>
          <div className="flex-container-row">
            <div className="jira-pill jira-pill__open" title="Open"><i className="fa fa-folder-o"></i>{this.state.jiraIssues[0].total}</div>
            <div className="jira-pill jira-pill__major" title="Major"><i className="fa fa-arrow-up"></i>{this.state.jiraIssues[0].major}</div>
            <div className="jira-pill jira-pill__inprogress" title="In Progress"><i className="fa fa-tasks"></i>{this.state.jiraIssues[0].inprogress}</div>
            <div className="jira-pill jira-pill__closed" title="Closed"><i className="fa fa-times-circle-o"></i>{this.state.jiraIssues[0].closed}</div>
            <div className="jira-pill jira-pill__unprioritized" title="No one cares about me"><i className="fa fa-eye-slash"></i>{this.state.jiraIssues[0].unprioritized}</div>
          </div>
        </div>
      </div>
    );
  }
}
