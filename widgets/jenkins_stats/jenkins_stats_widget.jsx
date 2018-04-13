import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';

import BaseWidget from '../widget.jsx';

import './jenkins_stats_widget.scss';

import * as Jenkins from './jenkins_stats_reducers.js';

/**
 * React Component
 */
export default class JenkinsStatsWidget extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = {title: "init", stats: [], filterByTime: 'last7days', filterByActiveBuilds: false, filterByTypeMasters: true, filterByTypeNightly: false, filterByLongRunning: '', search: '' };
    //by branch type (OR)
    this.setFilterMasters = this.setFilterMasters.bind(this)
    this.setFilterNightly = this.setFilterNightly.bind(this)
    //by Build status (AND)
    this.setFilterByActiveBuilds = this.setFilterByActiveBuilds.bind(this)
    //by time (AND)
    this.setFilterLast2Days = this.setFilterLast2Days.bind(this)
    this.setFilterLast7Days = this.setFilterLast7Days.bind(this)
    this.setFilterLast15Days = this.setFilterLast15Days.bind(this)
    this.setFilterLast30Days = this.setFilterLast30Days.bind(this)
    this.setFilterAll = this.setFilterAll.bind(this)
    this.resetFilters = this.resetFilters.bind(this)
  }

  setFilterMasters() {
    this.setState({filterByTypeMasters: !this.state.filterByTypeMasters })
  }

  setFilterNightly() {
    this.setState({filterByTypeNightly: !this.state.filterByTypeNightly })
  }

  setFilterByActiveBuilds() {
    this.setState({filterByActiveBuilds: !this.state.filterByActiveBuilds })
  }

  setFilterLast2Days() {
    this.setState({filterByTime: 'last2days' })
  }

  setFilterLast7Days() {
    this.setState({filterByTime: 'last7days' })
  }

  setFilterLast15Days() {
    this.setState({filterByTime: 'last15days' })
  }

  setFilterLast30Days() {
    this.setState({filterByTime: 'last30days' })
  }

  setFilterAll() {
    this.setState({filterByTime: 'all' })
  }

  resetFilters() {
    this.setState({filterByTime: '', filterByTypeMasters: true, filterByTypeNightly: true, search: '' })
  }

  renderBranchJobStats(job) {
    const successRate = Jenkins.branchScore(job.builds)
    const successRateClass = classNames({'value-hilite': true, 'score-33': successRate <= 50, 'score-66': successRate > 50 && successRate < 100, 'score-100': successRate >= 100})
    return (
      job.builds.length > 0 && (<div className="branch-job-stats">
        <div><span className="value-hilite">{job.builds.length}</span> builds</div>
        <div>Last build: <span className="value-hilite">{moment(job.builds[0].buildDetails.timestamp).fromNow()}</span></div>
        <div>Success Rate: <span className={successRateClass}>{successRate} %</span></div>
      </div>)
    )
  }

  renderStartedBy(cause) {
    let name = '', icon = ''
    if (cause.match(/.*timer$/)) {
      icon = 'moon-o'
    } else if (cause.match(/^Started by user.*/)) {
      icon = 'user'
      name =  cause.match(/^Started by user (.*)$/)[1]
    } else if (cause.match(/Branch indexing/)) {
      icon = 'bitbucket'
    } else if (cause.match(/Branch event/)) {
      icon = 'barcode'
    } else {
      icon = 'question-circle'
      name = 'whodunnit'
    }
    return (
      <div>
        <span className="started-by-user">{name}</span><span className="started-by-icon"><i className={`fa fa-${icon}`}></i></span>
      </div>
    )
  }

  renderRobotTestResultCount(robot, buildResult) {
    if (buildResult === null) {
      return "..."
    } else if (robot && robot.totalCount) {
      return robot.failCount === 0 ? `${robot.totalCount}` : `${(robot.totalCount - robot.failCount) + ' / ' + robot.totalCount}`
    } else {
      return 'No Tests'
    }
  }

  renderBuildDetails(key, builds) {
    return (
      builds.map(b => {
        const testResults = this.renderRobotTestResultCount(b.buildDetails.robot, b.buildDetails.result)
        const testsNone = testResults.indexOf('No Tests') >= 0
        const testsFailed = testResults.indexOf("/") >= 0
        const testsRunning = testResults.indexOf("...") >= 0
        const testResultsClass = classNames({tests: true, 'tests-none': testsNone, 'tests-failed': testsFailed, 'tests-passed': !testsNone && !testsFailed && !testsRunning})
        return (
          <div className="build-card animated flipInY" key={`${key}-${b.number}`} >
            <div>
              <div className={`left build-number ${b.buildDetails.result || 'RUNNING'}-color`}><a  target="_blank" href={b.url}>{b.number}</a></div>
              <div className="right icon-wrapper">{this.renderStartedBy(b.buildDetails.cause)}</div>
            </div>
            <div className={testResultsClass}>{testResults}</div>
            <div style={{marginTop: '0.5rem'}}>
              <div className="duration">{Jenkins.smartDurationString(b.buildDetails.duration)}</div>
              <div className="timestamp">{Jenkins.smartTimestampString(b.buildDetails.timestamp)}</div>
            </div>
          </div>
        )
      })
    )
  }

  renderJobs(jobs) {
    return (
      jobs.map(j => {
        return (
          <div key={j.name} className="repo-child branch-job">
            <div className="repo-container-row">
              <div className="repo-child-left">
                {j.name.replace('%2F', '/')}
                {this.renderBranchJobStats(j)}
              </div>
              <div className="repo-child-right">
                <div className="build-card-container">
                  {this.renderBuildDetails(j.branch, j.builds)}
                </div>
              </div>
            </div>
          </div>
        )
      })
    )
  }

  renderFilters(filteredStats) {
    const filteredSummary = Jenkins.statsSummary(filteredStats)
    return (
      <div className="filters-container">
        <div title="Show only masters" className={classNames({'filters-child': true, clickable: true, selected: this.state.filterByTypeMasters})} onClick={this.setFilterMasters}>masters</div>
        <div title="Show only nightly" className={classNames({'filters-child': true, clickable: true, selected: this.state.filterByTypeNightly})} onClick={this.setFilterNightly}>nightly</div>
        <div title="Show only currently running builds" className={classNames({'filters-child': true, clickable: true, selected: this.state.filterByActiveBuilds})} onClick={this.setFilterByActiveBuilds}>active</div>
        <div title="Show builds within last 2 days" className={classNames({'filters-child': true, clickable: true, selected: this.state.filterByTime === 'last2days'})} onClick={this.setFilterLast2Days}>2 days</div>
        <div title="Show builds within last 7 days" className={classNames({'filters-child': true, clickable: true, selected: this.state.filterByTime === 'last7days'})} onClick={this.setFilterLast7Days}>7 days</div>
        <div title="Show builds within last 15 days" className={classNames({'filters-child': true, clickable: true, selected: this.state.filterByTime === 'last15days'})} onClick={this.setFilterLast15Days}>15 days</div>
        <div title="Show builds within last 1 month" className={classNames({'filters-child': true, clickable: true, selected: this.state.filterByTime === 'last30days'})} onClick={this.setFilterLast30Days}>30 days</div>
        <div title="Show all builds" className={classNames({'filters-child': true, clickable: true, selected: this.state.filterByTime === 'all'})} onClick={this.setFilterAll}>all</div>
        <div title="Reset filters to defaults" className={classNames({'filters-child': true, clickable: true })} onClick={this.resetFilters}>reset filters</div>
        {/* <div className="filters-child search-container">
          <input type="text" name="search"></input>
        </div> */}
        <div className='filters-child filter-summary'>{this.renderSummary(filteredSummary)}</div>
      </div>
    )
  }

  renderSummary(summary) {
    return (
      <span>{summary.reposCount} Repos, {summary.jobsCount} Jobs, {summary.buildsCount} Builds, Score: {summary.score}%</span>
    )
  }


  render() {
    const { filterByTypeMasters, filterByActiveBuilds, filterByTypeNightly, filterByTime, filterByLongRunning, search } = this.state;
    const filteredStats = Jenkins.applyFilters(this.state.stats, { filterByTypeMasters, filterByActiveBuilds, filterByTypeNightly, filterByTime, filterByLongRunning, search })
    const totalSummary = Jenkins.statsSummary(this.state.stats)

    return (
      <div className={"jenkins_stats_widget widget"}>
        <h1>{this.props.title} - {this.renderSummary(totalSummary)}</h1>
        {this.renderFilters(filteredStats)}
        <div className="repos-container">
          {
            filteredStats.map(x => {
              return (
                <div key={x.repo} className="repo-container-column">
                  <div className="repo-child repo-job-header">{x.repo} (masters: {Jenkins.masterBranchScore(x.jobs)}%)</div>
                  {this.renderJobs(x.jobs)}
                </div>
              )
            })
          }
        </div>

      </div>
    );
  }
}
