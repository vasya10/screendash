/* eslint-disable no-console, no-unused-vars */
var config = require('./config.js');
var storage = config.getStorage();
import logger from './logger.js'

var moment = require('moment');

var allJobFiles = require('require-all')({
  dirname     :   __dirname + '/widgets',
  filter      :  /(.+_job)\.js$/,
  recursive   :true
});

var jobs = {}
for (var key in allJobFiles) {
  if (Object.keys(allJobFiles[key]).length > 0) {
    var k0 = allJobFiles[key]
    k0[Object.keys(k0)[0]].key = key
    Object.assign(jobs, allJobFiles[key])
  }
}

function update_widget(name, data, next_time) {
  logger.log('info', `[${name}]`, "updating widget: next update at: ", moment(next_time).format());
  storage.set(name, JSON.stringify({
    payload: data,
    next_time: next_time
  }), function(err, res) {
    if(err) {
      logger.log('info', err);
    }
  });
}

function reschedule(job) {
  setTimeout(function() {start_recurring_job(job)}, job.interval)
}

function start_recurring_job(job) {
    logger.log('info', `[${job.key}] start_recurring_job at intervals (${job.interval} ms)`);
    new Promise(job.promise)
    .then(
      function(widget_data) {
        for (var widget in widget_data) {
          update_widget(widget, widget_data[widget], moment().add(job.interval, 'ms'));
        }
        reschedule(job);
      }
    )
    .catch(
      function(error) {
        logger.log('info', error);
        reschedule(job);
      }
    );
}

for (var job in jobs) {
  logger.log('info', `[${job}] starting job`)
  if (jobs[job].enabled) {
    start_recurring_job(jobs[job]);
  }
}
