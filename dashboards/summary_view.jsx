import React from 'react';
import ReactDOM from 'react-dom';

import RGL, { WidthProvider } from 'react-grid-layout';

import QuoteWidget from 'widgets/startup_quote/quote_widget';
import JiraIssuesWidget from 'widgets/jira_issues/jira_issues_widget';
import JiraSprintWidget from 'widgets/jira_sprint/jira_sprint_widget';
import JenkinsSummaryWidget from 'widgets/jenkins_stats/jenkins_summary_widget';
import TwitterWidget from 'widgets/twitter/twitter_widget';
import BitBucketPRsWidget from 'widgets/bitbucket_prs/bitbucket_prs_widget';

const ReactGridLayout = WidthProvider(RGL);
var layout = [
  {i: 'startup_quote',       x: 0, y: 0, w: 1, h: 4},
  {i: 'jenkins_summary',     x: 1, y: 0, w: 1, h: 1},
  {i: 'bitbucket_prs',       x: 2, y: 0, w: 1, h: 2},
  {i: 'twitter',             x: 3, y: 0, w: 1, h: 2},

  {i: 'jira_sprint',         x: 1, y: 1, w: 1, h: 1},

  {i: 'jira_issues_project_01', x: 1, y: 2, w: 1, h: 1},

  {i: 'jira_issues_project_02', x: 1, y: 3, w: 1, h: 1}

];


export default class SummaryView extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ReactGridLayout className="layout" cols={4} layout={layout} rowHeight={185}>
        <div key="startup_quote"><QuoteWidget name="startup_quote" title="Startup Quote" /></div>
        <div key="jira_issues_project_01"><JiraIssuesWidget name="jira_issues" title="PROJECT-01" /></div>
        <div key="jira_issues_project_02"><JiraIssuesWidget name="jira_issues" title="PROJECT-02" /></div>
        <div key="jira_sprint"><JiraSprintWidget name="jira_sprint" title="Sprint" /></div>
        <div key="jenkins_summary"><JenkinsSummaryWidget name="jenkins_stats" title="Jenkins" /></div>
        <div key="bitbucket_prs"><BitBucketPRsWidget name="bitbucket_prs" title="Open PRs" /></div>
        <div key="twitter"><TwitterWidget name="twitter" title="Tweets" /></div>
      </ReactGridLayout>
    );
  }
}
