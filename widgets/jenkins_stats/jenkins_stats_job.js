import request from 'request-promise-native'
import _ from 'lodash'
import fs from 'fs'
import logger from '../../logger.js'

const config = require('../../config/app-config.json')['jenkins']
const url = config.url
const queryMasterBranchesOnly = config.queryMasterBranchesOnly

import { isMasterBranch } from './jenkins_stats_reducers'

export const enabled = config.enabled;
export const interval = config.interval * 60 * 1000;

const stats = require('../../data-log/jenkins-stats.json')
export const promise = (fulfill, reject) => {
  fulfill({
    jenkins_stats: { stats }
  })
}

// export const promise = (fulfill, reject) => {
//   logger.log('info', "[jenkins_stats]: START")
//   fetch(url).then((repoJobs) => {
//     fetchMultiBranchJobs(repoJobs).then(mbjs => {
//       // write to an intermediate file, useful for debugging
//       // fs.writeFileSync('./data-log/jenkins-multibranches.json', JSON.stringify(mbjs, undefined, 2))
//       fetchBuildNumbers(mbjs).then(builds => {
//         // fs.writeFileSync('./data-log/jenkins-build-numbers.json', JSON.stringify(builds, undefined, 2))
//         fetchBuildDetails(builds).then(buildDetails => {
//           // fs.writeFileSync('./data-log/jenkins-build-details.json', JSON.stringify(buildDetails, undefined, 2))
//           const stats = mergeAllBuilds(mbjs, builds, buildDetails)
//           fs.writeFileSync('./data-log/jenkins-stats.json', JSON.stringify(stats, undefined, 2))
//           logger.log('info', "[jenkins_stats]: DONE")
//           fulfill({
//             jenkins_stats: { stats }
//           })
//         })
//       })
//     })
//   }).catch((err) => {
//     console.error("[jenkins_stats]: error:", err)
//   })
// }

async function fetchMultiBranchJobs(repoJobs) {
  return Promise.all(_(repoJobs.jobs).map(async(j) => {
    const mbj = await fetch(j.url)
    return {
      repo: mbj.name,
      url: mbj.url,
      score: _.isEmpty(mbj.healthReport) ? 0 : mbj.healthReport[0].score,
      worstHealth: _.isEmpty(mbj.healthReport) ? "0" : mbj.healthReport[0].description,
      jobs: _(mbj.jobs)
              .filter(j1 => queryMasterBranchesOnly ? isMasterBranch(j1.name) : true)
              .map(j0 => {
                return {name: j0.name, url: j0.url, color: j0.color}
              }).value(),
      color: mbj.color
    }
  }).value())
}

async function fetchBuildNumbers(mbjs) {
  return Promise.all(_.map(mbjs, (mbj) => {
    return fetchBuildNumbersPerRepo(mbj).then((b0) => {
      return {
        repo: mbj.repo,
        builds: _.flatten(b0)
      }
    })
  }))
}

async function fetchBuildNumbersPerRepo(mbj) {
  return Promise.all(_(mbj.jobs).map(async(j) => {
    const build = await fetch(j.url)
    return _.map(build.builds, b1 => {
      return { repo: mbj.repo, branch: j.name, number: b1.number, url: b1.url }
    })
  }).value())
}

async function fetchBuildDetails(repoBuilds) {
  return Promise.all(_.map(repoBuilds, (rb) => {
    return fetchBuildDetailsPerRepo(rb).then((b0) => {
      return {
        repo: rb.repo,
        buildDetails: _.flatten(b0)
      }
    })
  }))
}

async function fetchBuildDetailsPerRepo(repoBuild) {
  return Promise.all(_(repoBuild.builds).map(async(b) => {
    const buildDetail = await fetch(b.url)
    return {
      branch: b.branch,
      number: b.number,
      duration: buildDetail.duration,
      timestamp: buildDetail.timestamp,
      queueId: buildDetail.queueId,
      result: buildDetail.result,
      cause: findCauseAction(buildDetail.actions),
      robot: findRobotAction(buildDetail.actions)
    }
  }).value())
}

const findCauseAction = (actions) => {
  const ca = _.find(actions, x => x['_class'] === 'hudson.model.CauseAction')
  return ca ? ca.causes[0].shortDescription : ""
}

/**
 * specific information for RobotFramework Test Results
 */
const findRobotAction = (actions) => {
  const ra = _.find(actions, x => x['_class'] === 'hudson.plugins.robot.RobotBuildAction')
  return ra ? { failCount: ra.failCount, skipCount: ra.skipCount, totalCount: ra.totalCount } : {}
}

const mergeAllBuilds = (mbjs, buildNumbers, buildDetails) => {
  mbjs.forEach(mbj => {
    mbj.jobs.forEach(branchJob => {
      branchJob['builds'] = _(buildNumbers)
        .filter(bn => bn.repo === mbj.repo)
        .map("builds").flatten()
        .filter(x => x.branch === branchJob.name).value()
      branchJob.builds.forEach(b => {
        b['buildDetails'] = _(buildDetails)
          .filter(bd => bd.repo === mbj.repo)
          .map("buildDetails")
          .flatten()
          .filter(x => x.branch === branchJob.name && x.number === b.number).value()[0]
      })
    })
  })
  return mbjs
}

async function fetch(url) {
  let body = []
  try {
    body = await request({url: `${url}api/json`, json: true})
  } catch (err) {
    logger.log('info', "[jenkins_status]: fetch", err)
  }

  return body
}
