import request from 'request-promise-native'
import _ from 'lodash'
import fs from 'fs'
import logger from '../../logger.js'

const config = require('../../config/app-config.json')['jira']

const url = config.url
const activeSprintUrl = config.activeSprintUrl
const headers = { 'cache-control': 'no-cache', 'content-type': 'application/json', authorization: `Basic ${config.auth}` }
const filters = config.sprint.filters

export const interval = config.interval * 60 * 1000;
export const enabled = config.enabled;

const jiraSprint = require('../../data-log/jira-sprint.json')
export const promise = (fulfill, reject) => {
  fulfill({
    jira_sprint: { jiraSprint }
  })
}

// export const promise = (fulfill, reject) => {
//   logger.log('info', "[jira_sprint]: START")
//   fetchActiveSprint().then((sprint) => {
//     filters.find(x => x.title === 'Sprint').jql = `Sprint='${sprint.name}'`
//     fetchJiraIssues(filters).then((jiraIssues) => {
//       fs.writeFileSync('./data-log/jira-sprint.json', JSON.stringify(jiraIssues, undefined, 2))
//       logger.log('info', "[jira_sprint]: DONE")
//       fulfill({
//         jira_sprint: {jiraIssues, sprint },
//       })
//     })
//   }).catch((err) => {
//     console.error("[jira_sprint]: error", err)
//   })
// }

async function fetchActiveSprint() {
  const json = await fetchJiraApi(activeSprintUrl)
  const sprint = {name: '', date: ''}
  if (json && json.values && json.values.length > 0) {
    sprint.name = json.values[0].name.split(':')[0]
    sprint.date = json.values[0].name.split(':')[1]
  }
  return Promise.resolve(sprint)
}

async function fetchJiraIssues(filters) {
  return Promise.all(_(filters).map(async(f) => {
    const jiraIssues = await fetchJiraSearchQuery(url, f)
    logger.log('info', "[jira_sprint]: filter result:", f.title, f.jql, jiraIssues.total)
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

async function fetchJiraApi(url) {
  let body = { }
  try {
    body = await request({ method: 'GET', url, headers, json: true })
  } catch (err) {
    logger.log('info', "[jira_sprint] fetchJiraApi:", err)
  }

  return body
}

async function fetchJiraSearchQuery(url, filter) {
  let body = { issues: [] }
  try {
    logger.log('info', "[jira_sprint]: FilterJQL", filter)
    body = await request({ method: 'GET', url, qs: { jql: filter.jql, maxResults: filter.maxResults }, headers, json: true })
  } catch (err) {
    logger.log('info', "[jira_sprint] fetchJiraSearchQuery:", err)
  }

  return body
}
