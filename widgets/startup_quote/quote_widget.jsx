import React from 'react';
import BaseWidget from '../widget.jsx';

import './quote_widget.scss';

export default class QuoteWidget extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = {title: "init", text: '', imageUrl: ''};
  }

  render() {
    return (
      <div className={"quote_widget widget"}>
        <h1>{this.props.title}</h1>
        <img src={this.state.imageUrl} />
      </div>
    );
  }
}
