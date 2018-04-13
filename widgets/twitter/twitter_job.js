import request from 'request'
import Twitter from 'twitter'
import logger from '../../logger.js'

const config = require('../../config/app-config.json')['twitter']

const url = config.url
const twitterKeys = {
  "consumer_key": process.env.TWITTER_CONSUMER_KEY || config.accessKeys.consumer_key,
  "consumer_secret": process.env.TWITTER_CONSUMER_SECRET || config.accessKeys.consumer_secret,
  "access_token_key": process.env.TWITTER_ACCESS_TOKEN_KEY || config.accessKeys.access_token_key,
  "access_token_secret": process.env.TWITTER_ACCESS_TOKEN_SECRET || config.accessKeys.access_token_secret
}
const twitterKeys = config.accessKeys
const displaySearchTerm = config.displaySearchTerm
const searchTerm = config.searchTerm

const client = new Twitter(twitterKeys)

export const interval = config.interval * 60 * 1000;
export const enabled = config.enabled;

export const promise = (fulfill, reject) => {
  client.get('search/tweets',{ q: searchTerm, lang: 'en', count: 12}, (error, tweets, response) => {
    if (!error && response.statusCode == 200) {
      // logger.log('info', "tweet", JSON.stringify(tweets, undefined, 2))
      fulfill({
        twitter: {tweets: tweets.statuses, total: tweets.statuses.length, displaySearchTerm}
      })
    } else {
      reject(error);
    }
  });
}
