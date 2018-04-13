import request from 'request-promise-native'
import _ from 'lodash'
import fs from 'fs'
import logger from '../../logger.js'

const config = require('../../config/app-config.json')['jira']

const url = config.url
const activeSprintUrl = config.activeSprintUrl
const headers = { 'cache-control': 'no-cache', 'content-type': 'application/json', authorization: `Basic ${config.auth}` }
const filters = config.issues.filters

export const interval = config.interval * 60 * 1000;
export const enabled = config.enabled;

const jiraIssues = require('../../data-log/jira-issues.json')
export const promise = (fulfill, reject) => {
  fulfill({
    jira_issues: { jiraIssues }
  })
}

// export const promise = (fulfill, reject) => {
//   logger.log('info', "[jira_issues]: START")
//   fetchJiraIssues(filters).then((jiraIssues) => {
//     fs.writeFileSync('./data-log/jira-issues.json', JSON.stringify(jiraIssues, undefined, 2))
//     logger.log('info', "[jira_issues]: DONE")
//     fulfill({
//       jira_issues: {jiraIssues}
//     })
//   }).catch((err) => {
//     console.error("[jira_issues]", err)
//   })
// }

async function fetchJiraIssues(filters) {
  return Promise.all(_(filters).map(async(f) => {
    const jiraIssues = await fetch(url, f)
    logger.log('info', "[jira_issues]: filter result", f.title, f.jql, jiraIssues.total)
    return {
      title: f.title,
      total: jiraIssues.total,
      major: _.filter(jiraIssues.issues, ji => ji.fields.priority.name === 'Major').length,
      unprioritized: _.filter(jiraIssues.issues, ji => ji.fields.priority.name === 'Not Prioritized').length,
      open: _.filter(jiraIssues.issues, ji => ji.fields.status.name === 'Open').length,
      inprogress: _.filter(jiraIssues.issues, ji => ji.fields.status.name === 'In Progress').length,
      closed: _.filter(jiraIssues.issues, ji => ji.fields.status.name === 'Closed' || ji.fields.status.name === 'Resolved').length,
    }
  }).value())
}

async function fetch(url, filter) {
  let body = { issues: [] }
  try {
    logger.log('info', "[jira_issues]: FilterJQL", filter.jql)
    body = await request({ method: 'GET', url, qs: { jql: filter.jql, maxResults: 200 }, headers, json: true })
  } catch (err) {
    logger.log('info', "[jira_issues]: fetch", err)
  }

  return body
}
