import React from 'react';
import ReactDOM from 'react-dom';
import { VictoryChart, VictoryBar, Bar } from 'victory'
import _ from 'lodash'

const js = require('../data-log/jenkins-stats.json')
const result = []

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


export default class BuildView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: _.map(result, item => {
        return {
          x: item.timestamp,
          y: item.duration / 60000
        }
      }),
      style: {
        data: { fill: 'tomato'}
      }
    }
  }

  render() {
    return (
      <div>
        <VictoryChart height={400} width={800} scale={{x: 'time'}}>
          <VictoryBar
            dataComponent={ <Bar /> }
            style={this.state.style}
            data={this.state.data}
          />
        </VictoryChart>
      </div>
    );
  }
}
