import React from 'react';
import BaseWidget from '../widget.jsx';
import moment from 'moment';

import './bitbucket_prs_widget.scss';

export default class BitBucketPRsWidget extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = {title: "init", prs: [] };
  }

  render() {
    return (
      <div className={"bitbucket_prs_widget widget"}>
        <h1>{this.props.title}</h1>
        <div className="bb-container">
          {
            this.state.prs.map(x => {
              return (
                <div key={x.slug} className="bb-item">
                  <div className="bb-pill bb-pill__open"><i className="fa fa-folder-open-o"></i>{x.count}</div>
                  <div className="bb-name">{x.slug}
                    <span className="bb-name__authors">{_(x.items).map("author").uniq().valueOf().join(', ')}</span><br/>
                    <span className="bb-name__subtext">{moment(x.items[0].updatedDate).fromNow()}</span>
                  </div>
                </div>
              )
            })
          }
        </div>

      </div>
    );
  }
}
