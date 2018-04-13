import request from 'request'
import parser from 'rss-parser'
import logger from '../../logger.js'

const config = require('../../config/app-config.json')['startup_quote']
const url = 'http://feeds.feedburner.com/StartupQuote?format=xml';

export const interval = 300000;
export const enabled = config.enabled;

export const promise = (fulfill, reject) => {
  parser.parseURL(url, (error, response) => {
    if (!error) {
      // logger.log('info', "Feeds:", response.feed.entries)
      let randomInt = getRandomIntInclusive(0, response.feed.entries.length-1)
      let randomQuote = response.feed.entries[randomInt]
      logger.log('info', "[startup_quote]: randomQuote:", randomQuote.contentSnippet)
      let regex = new RegExp(/img.*?src="(.*?)"/i)
      let imageUrl = regex.exec(randomQuote.content)
      if (imageUrl) {
        fulfill({
          startup_quote: { text: randomQuote.contentSnippet, imageUrl: imageUrl[1]}
        })
      } else {
        reject(error);
      }
    }
  });
};


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
