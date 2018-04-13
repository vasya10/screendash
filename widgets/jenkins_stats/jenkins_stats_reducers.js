/** Jenkins Calculations **/
import moment from 'moment';
import _ from 'lodash';
import logger from '../../logger.js'

const config = require('../../config/app-config.json')['jenkins']
const masterBranches = config.masterBranches

export const isMasterBranch = (name) => {
  return masterBranches.indexOf(name) >= 0 || name.indexOf('stable') === 0
}

export const totalJobs = (repos) => {
  return _.reduce(repos, (sum, x) => sum + x.jobs.length, 0)
}

export const totalBuilds = (repos) => {
  return _.reduce(repos, (sum, x) => sum + _.reduce(x.jobs, (s0, y) => s0 + y.builds.length, 0), 0)
}

export const totalSuccessfulBuilds = (repos) => {
  return _.reduce(repos, (sum, x) => sum + _.reduce(x.jobs, (s0, y) => s0 + y.builds.filter(z => z.buildDetails.result === 'SUCCESS').length, 0), 0)
}

export const smartDurationString = (duration) => {
  const hour = moment.duration(duration).get("hours")
  const minutes = moment.duration(duration).get("minutes")

  return hour > 0 ? `${hour}h:${minutes}m` : `${minutes}m`
}

export const smartTimestampString = (timestamp) => {
  return moment(timestamp).format("MMM DD, HH:mm")
}

export const scorePercent = (count, total) => {
  return (count * 100 / (total || 1)).toFixed(2)
}

export const branchScore = (builds) => {
  const successCount = _.filter(builds, b => b.buildDetails.result === 'SUCCESS').length
  return scorePercent(successCount, builds.length)
}

export const masterBranchCount = (jobs) => {
  const masterJobs = _.filter(jobs, x => isMasterBranch(x.name))
  const successCount = _.reduce(masterJobs, (sum, x) => sum + _.filter(x.builds, b => b.buildDetails.result === 'SUCCESS').length, 0)
  const buildsCount = _.reduce(masterJobs, (sum, x) => sum + x.builds.length, 0)
  return { successCount, buildsCount }
}

export const masterBranchScore = (jobs) => {
  const mb = masterBranchCount(jobs)
  return scorePercent(mb.successCount, mb.buildsCount)
}

export const masterBranchesScore = (repos) => {
  const mbs = _.reduce(repos, (mb, x) => {
    const mbc = masterBranchCount(x.jobs)
    return { success: mb.success + mbc.successCount, builds: mb.builds + mbc.buildsCount }
  }, {success: 0, builds: 0})
  return mbs ? scorePercent(mbs.success, mbs.builds) : '0.00'
}

export const activeBuildsCount = (repos) => {
  const abc = _.reduce(repos,
                        (sum, r) => sum + _.reduce(r.jobs, (sub , j) => sub + j.builds.filter(b => b.buildDetails.result === null).length, 0),
                        0)
  return abc
}

export const statsSummary = (stats) => {
  const reposCount = stats.length
  const jobsCount = totalJobs(stats)
  const buildsCount = totalBuilds(stats)
  const successCount = totalSuccessfulBuilds(stats)
  const score = scorePercent(successCount, buildsCount)
  const masterScore = masterBranchesScore(stats)
  const activeCount = activeBuildsCount(stats)

  return { reposCount, jobsCount, buildsCount, successCount, score, masterScore, activeCount }
}

export const applyFilters = (given, f) => {
  let result = _.filter(_.cloneDeep(given), x => x.jobs.length > 0)
  // logger.log('info', "filters:", f)
  result.forEach(repo => {
    let jfm = repo.jobs.filter(x => f.filterByTypeMasters ? isMasterBranch(x.name) : true)
    repo['jobs'] = jfm
    repo['jobs'].forEach(job => {
      // logger.log('info', "applyFilters:BEFORE", repo.repo, job.name, job.builds.length)
      let bf = job.builds.filter(b => f.filterByActiveBuilds ? b.buildDetails.result === null : true)
                          .filter(b => f.filterByTime === 'last2days' ? b.buildDetails.timestamp >= moment.now() - moment.duration(2, 'days') : true)
                          .filter(b => f.filterByTime === 'last7days' ? b.buildDetails.timestamp >= moment.now() - moment.duration(7, 'days') : true)
                          .filter(b => f.filterByTime === 'last15days' ? b.buildDetails.timestamp >= moment.now() - moment.duration(15, 'days') : true)
                          .filter(b => f.filterByTime === 'last30days' ? b.buildDetails.timestamp >= moment.now() - moment.duration(30, 'days') : true)
                          .filter(b => f.filterByTypeNightly ? b.buildDetails.cause.indexOf('timer') >= 0 : true)
      job['builds'] = bf
      // logger.log('info', "applyFilters:AFTER", repo.repo, job.name, job.builds.length)
      // logger.log('info', "bf.length", bf.length)
    })
    repo['jobs'] = repo['jobs'].filter(x => x.builds.length > 0)
    repo['jobs'] = _.orderBy(repo['jobs'], 'builds[0].buildDetails.timestamp', 'desc')
  })
  result = result.filter(x => x.jobs.length > 0)
  result = _.orderBy(result, 'jobs[0].builds[0].buildDetails.timestamp', 'desc')
  return result
  // return result.filter(x => x.jobs.length > 0)
}
