var js = require('./jenkins-stats.json')
var _ = require('lodash')

// [ { x: timestamp, y: duration }]
var result = []

_.each(js, r => {
  _.each(r.jobs, j => {
    _.each(j.builds, b => {
      var k = {
        repo: r.repo,
        job: j.name,
        color: j.color,
        number: b.number,
        duration: b.buildDetails.duration,
        timestamp: b.buildDetails.timestamp,
        result: b.buildDetails.result,
        cause: b.buildDetails.cause,
        totalCount: b.buildDetails.robot.totalCount,
        failCount: b.buildDetails.robot.failCount
      }
      result.push(k)

    })
  })
})

console.log(result)
