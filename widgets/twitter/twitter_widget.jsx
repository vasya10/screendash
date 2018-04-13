import React from 'react';
import classNames from 'classnames';

import BaseWidget from '../widget.jsx';
const twitterText = require('twitter-text');

import './twitter_widget.scss';

const createTwitterHtml = (text) => {
  return { __html: twitterText.autoLink(text) }
}
export default class TwitterWidget extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = {title: "init", tweets: [], total: 0, displaySearchTerm: ''};
  }

  render() {
    return (
      <div className={`twitter_widget widget`}>
        <h1><i className="fa fa-twitter"></i>{this.props.title}</h1>
        <div className="subtext">{this.state.displaySearchTerm}</div>
        <ul>
          {
            this.state.tweets.map(x => {
              return <li key={x.id_str}><div dangerouslySetInnerHTML={createTwitterHtml(x.text)}></div></li>
            })
          }
        </ul>
      </div>
    );
  }
}
