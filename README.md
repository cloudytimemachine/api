
# Cloudy Time Machine API Service

This is the RESY api service for the Cloudy Time Machine (CTM) project. The CTM is a modern implementation of the [Wayback Machine, the Internet Archive](https://archive.org/). This project was developed as a proof of concept and demonstration of a relatively simple real world app in a cloud native architecture.

The CTM api Service is the public-facing api for the CTM project. It provides a REST api to request snapshots query previous snapshots. It is intended to be run in conjunction with the rest of the CTM services.

The API service communicates with [worker-screenshot]() instances using Redis as a message bus.  Snapshot metadata is stored in a RethinkDB database.

The complete API is documented using [Swagger](https://swaggerhub.com/) which can be found [here](./swaagger.yaml)

### Install required software:
  * Node.js
  * [RethinkDB](rethinkdb.com)
  * [Redis](redis.io)

### Getting started

Clone this repo, install, and start the api service
```
git clone https://github.com/cloudytimemachine/api.git
cd api
npm install
npm start
```

The api service logs to stdout using [bunyan](https://github.com/trentm/node-bunyan) by default. For easier reading,
pipe `npm start` to the bunyan CLI.

```
npm start | bunyan
```


## Internal HTTP REST api

### GET :3001/version
Returns the current version string (from package.json)

### GET :3001/healthz
Returns 200 with no content if healthy
Returns 500 with error message if not healthy
