# Screendash

This dashboard is based on the awesome [Handsome](http://github.com/davefp/handsome) project. Much thanks to @davefp for providing a simple framework to implement this.

An active example of this dashboard with sample data is at [vasya10-screendash](https://damp-brook-29853.herokuapp.com/). The Jenkins mock dashboard is available at [Jenkins Dashboard](https://damp-brook-29853.herokuapp.com/?view=jenkins)

## Purpose

Provides a beautiful NodeJS/ReactJS based framework for displaying whatever statistics you want to program, that you can customize to whatever style you want.

This tool is **designed** for displaying in a big screen monitor in your office.

## Story

Why did I build this? Several reasons. At Lumina Networks, our Jenkins Multibranch pipeline was getting very complex and could not provide a quick visualization of chronology of builds. I initially looked at Dashing (Ruby based), but it was already being discontinued and harder to get widgets working. I then looked at its newer avatar Smashing (also Ruby based), but quickly found out I was spending more time fighting the code than writing new features. I searched around a bit and found Handsome, itself based on concepts of Dashing and using the ReactJS ecosystem, which I was very familiar with. It took minutes to build on that stuff, though I had to refactor it a bit to suit my goals and preferences. So here it is. Use it at your own risk.

The hardest thing was to find an unique name in github. Whatever `*dash*` I looked in for a name, such a project already existed. Finally thought of `screendash` because the data visualization really shows up nicely in a big screen.

## Quick Start

### Prerequisites

You will need

- NodeJS - first install [nvm](https://github.com/creationix/nvm) and then do an `nvm install v8.9.0` (or latest in 8.x)
- yarn - Node Package Manager [*yarn*](https://yarnpkg.com/en/)
- redis - [Read the quickstart guide to get going quickly](http://redis.io/topics/quickstart)
- Docker and Docker Compose, if you choose to build using docker

### Installation

Clone this repository.

```sh
cd screendash
# Install dependencies
# This will also build your js bundle and place it in the `build` directory.
yarn install
# Start redis in a separate terminal
redis-server
# Start server
yarn start
```

Open <http://localhost:3000> to see the default dashboard. Click on "Jenkins" to view the Jenkins Dashboard.

By default the data is read from the given sample json files under `data-log` directory. All the configuration values are provided in `config/app-config.json` file. Update these values to your system values. See the Features > Configuration section below for full details of the available configuration parameters.

If you do not need a particular job/widget, simply delete the `widgets/$widgetName` folder and any corresponding references in the source code files.

Feel free to play with the fonts, scss files to adjust the styles. In development mode, webpack compiles and renders the changes on the fly.

### Deploying an instance using Docker

This assumes you already have docker installed in your system. The makefile provides some commands  that can be invoked to run a docker instance.

```sh
# create the docker image (creates from NodeJS base and installs yarn and the app)
make docker-image
# run docker image (runs the docker-compose using the docker images just built)
make run
```

## Features

While the basic functional implementation and technology is retained from **Handsome**, some significant improvements have been made, so it is easier to develop widgets.

**Features Retained**

1. ReactJS/ES6/Webpack3 based
1. Redis server for data cache
1. Job Polling

**Feature Improvements**

1. Uses a configuration file for all the job parameters (`config/app-config.json`)
1. Uses Material Design styling and displays information as cards
1. Multiple Dashboards (change logic in index.jsx for more dashboards)
1. Folder structure changed to feature-based structure (instead of type-based structure). This allows all files related to a widget (jsx, *job.js, *.scss) to be under a single folder. If you want to remove a widget, just delete the folder.
1. Adds [animate.css](https://daneden.github.io/animate.css/) to allow beautiful css animations
1. Uses ReactGridLayout instead of Packery, which provides a React based Grid layout
1. Dockerfile and docker-compose file to run both the UI and Redis
1. Uses Winston logger for logging and debugging

**Bundled Widgets**

Following widgets are bundled along with the project. See explanation of each bundled widget below.

1. Jenkins Multibranch Pipeline Dashboard
1. Atlassian JIRA widget to retrieve Sprint Info
1. Atlassian Bitbucket widget to retrieve pending Pull Requests
1. Twitter widget to dispaly close-to real time tweets for a specific Search Term
1. Inspirational quotes from startupquote.com


### Jenkins Multibranch Pipeline Dashboard

Tested with: **Jenkins 2.60**

This is arguably the most useful widget of this project. With the implementation of Jenkins Multibranch Pipelines, have you ever wondered how to get a complete view of all your builds in one glance? With extra level hierarchy, Jenkins does not provide an easy way to aggregate this data. This widget solves that problem.

#### Configuration

```json
  "jenkins": {
    "interval": 15,
    "url": "http://dashboard.myjenkins.com/",
    "masterBranches": ["master", "stable-1.0.0", "stable-2.0.0"],
    "queryMasterBranchesOnly": true,
    "enabled": true
  }
```

| Key                     | Description                                                                                                                                                                                                       |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interval                | in minutes to poll the data.                                                                                                                                                                                      |
| url                     | replace it with your Jenkins url                                                                                                                                                                                  |
| masterBranches          | if you have a huge number of build jobs, Jenkins API query will choke the system. Sometimes you need only the builds of master branches and ignore all the feature branches. Set your master/stable branches here |
| queryMasterBranchesOnly | true: only the above specified master branches be queried from Jenkins; false, all branch jobs will be queried (may choke your system)                                                                            |

- Jenkins builds
- JIRA issues
- BitBucket PRs
- Realtime tweets given a specific hashtag
- Inspirational quotes from startupquote.com

### JIRA issues

Tested with: **JIRA 7.x**

There are two widgets for JIRA. One widget provides a quick glance of Jira issue count for a given JQL. Shows counts for Open, In Progress, Major, Closed and Others. JQLs can be configured in the issues.filters key. Each filter will be displayed as a small widget. Your JIRA instance must have REST API access enabled. The second widget displays Current Sprint info.

```json
  "jira": {
    "url": "http://dashboard.myjira.com/rest/api/2/search",
    "activeSprintUrl": "http://dashboard.myjira.com/rest/agile/1.0/board/2/sprint?state=active",
    "auth": "$your-auth-key",
    "issues": {
      "filters": [
        {
          "title": "PROJECT-01",
          "jql": "project = PROJECT-01"
        },
        {
          "title": "PROJECT-02",
          "jql": "project = PROJECT-02 AND fixVersion in (1.0.0)"
        }
      ]
    },
    "sprint": {
      "filters": [
        {
          "title": "Sprint",
          "jql": "Sprint=",
          "maxResults": 100
        }
      ]
    }
  }
```

### Bitbucket Pull Requests

This widget displays all the open pull requests in one card. It displays count of PRs per project, who created the PR last and how long ago.

```json
  "bitbucket": {
    "url": "http://dashboard.mybitbucket.com/rest/api/1.0/projects",
    "auth": "$your-auth-key",
    "interval": 11,
    "enabled": true
  }
```

### Twitter Feed

This widget displays tweets for a given Search Term. Refreshes every 3 minutes by default. Generate your own twitter access keys according to the Twitter Guidelines.

```json
  "twitter": {
    "accessKeys": {
      "consumer_key": "$consumer-key",
      "consumer_secret": "$consumer-secret",
      "access_token_key": "$access-token-key",
      "access_token_secret": "$access-token-secret"
    },
    "displaySearchTerm": "@JavascriptDaily",
    "searchTerm": "from:@JavascriptDaily OR #Javascript",
    "interval": 3,
    "enabled": true
  }
```

Twitter keys can also be provided as environment variables, see `twitter/twitter_job.js` file for the actual env names.

### Startup Quote

A very simple widget which displays a quote from startupquote.com and refreshes it every minute.

You can enable disable / enable any widget by simpling setting the `enabled` property to false/true respectively.

## How does it work?

Behind the scenes, `screendash` runs a simple NodeJS [Express](http://expressjs.com/) app to serve widget data and repeatedly schedule jobs to generate new widget data. The data is stored in redis.

Widgets are parameterized and the configuration are loaded from `config/app-config.json` file. While running the production instance on Docker, you can externalize this configuration file by volume mapping it as `$hostConfigDir:/opt/app/config`, where `$hostConfigDir` is the directory where the customized app-config.json is present.

In development, the app will auto-generate and serve the client-side assets. Changing a source file will cause the relevant bundle to be regenerated on the fly.
