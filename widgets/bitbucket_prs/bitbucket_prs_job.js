import request from 'request-promise-native'
import _ from 'lodash'
import fs from 'fs'
import logger from '../../logger.js'

const config = require('../../config/app-config.json')['bitbucket']

const url = config.url
const headers = { 'cache-control': 'no-cache', 'content-type': 'application/json', authorization: `Basic ${config.auth}` }

export const interval = config.interval * 60 * 1000;
export const enabled = config.enabled;

const prs = require('../../data-log/bitbucket-prs.json')
export const promise = (fulfill, reject) => {
  fulfill({
    bitbucket_prs: {prs}
  })
}

// export const promise = (fulfill, reject) => {
//   logger.log('info', "[bitbucket_prs]: START")
//   fetch(url).then((repos) => {
//     fetchPRs(repos).then((prs) => {
//       prs = _.reject(prs, x => x.count <= 0)
//       fs.writeFileSync('./data-log/bitbucket-prs.json', JSON.stringify(prs, undefined, 2))
//       logger.log('info', "[bitbucket_prs]: DONE")
//       fulfill({
//         bitbucket_prs: {prs: _.orderBy(prs, [x => x.items[0].updatedDate], ['desc'])}
//       })
//     }).catch((err) => {throw err});
//   }).catch((err) => {
//     console.error("[bitbucket_prs]: error:", err)
//   })
// }

async function fetchPRs(repos) {
  return Promise.all(_(repos).map(async(r) => {
    const pr = await fetch(`${url}/${r.slug}/pull-requests/`)
    return {
      slug: r.slug,
      count: pr.length,
      items: _.map(pr, x => { return { title: x.title, updatedDate: x.updatedDate, author: x.author.user.name }})
    }
  }).value())
}

async function fetch(url) {
  let body = { values: [] }
  try {
    body = await request({ method: 'GET', url, qs: { limit: 100 }, headers, json: true })
  } catch (err) {
    logger.log('info', "[bitbucket_prs]: fetch:", err)
  }

  return body['values']
}
