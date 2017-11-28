
//
// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
"use strict";
// Imports the Google Cloud client library
const Monitoring = require('@google-cloud/monitoring');
// import the configuration
const config = require('./config.json');
// Instantiates a monitoring client
const client = Monitoring.v3.metric();
// gets a random integer between a [min - max-1]
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}
// [START insertCustomMetric]
/**
 * Creates an arbitrary custom metric based on the time of the day.
 *
 * @param {object} args The Node JS process arguments [PROJECTID] [INSTANCEID] [ZONEID]
 */
function insertCustomMetric(args){
  var projectId = args[2];
  var instanceId = args[3];
  var zoneId = args[4].slice(args[4].lastIndexOf("/")+1);
  var dataValue = 0;
  var minutes = new Date().getMinutes();
  if ((minutes >= 0) && (minutes < 30)) {
    dataValue = getRandomInt(config.LOW_VAL_MIN,config.LOW_VAL_MAX);   // scale down metric value 
  } else {
    dataValue = getRandomInt(config.HIGH_VAL_MIN,config.HIGH_VAL_MAX); // scale up metric value 
  }
  console.info("projectId: "+projectId + ", zoneId: "+zoneId+", instanceId: "+instanceId +", dataValue: "+dataValue);
    const dataPoint = {
      interval: {
        endTime: {
          seconds: Date.now() / 1000
        }
      },
      value: {
        doubleValue: dataValue
      }
    };
    const timeSeriesData = {
      metric: {
        type: config.METRIC_TYPE,
        labels: {
          queue_name: config.METRIC_QUEUE_NAME
        }
      },
      resource: {
        type: 'gce_instance',
        labels: {
          project_id: projectId,
          zone: zoneId,
          instance_id: instanceId
        }
      },
      points: [
        dataPoint
      ]
    };
    const request = {
      name: client.projectPath(projectId),
      timeSeries: [
        timeSeriesData
      ]
    };
    console.log(JSON.stringify(request));
    // Writes time series data
    client.createTimeSeries(request)
      .then((results) => {
        console.info(`Finished writing time series data.`);
      })
      .catch((err) => {
        console.error('ERROR:', err);
      });
}
// [END insertCustomMetric]

 function main() {

    // [START insertCustomMetric]
    /**
     * Creates an arbitrary custom metric based on the time of the day.
     *
     * @param {object} args The Node JS process arguments [PROJECTID] [INSTANCEID] [ZONEID]
     */
    if (process.argv.length != 5) {
        console.error("Usage: writeToCustomMetric.js [PROJECTID] [INSTANCEID] [ZONEID]");
    } else {
        insertCustomMetric(process.argv);

    }
    // [END insertCustomMetric]  


}

if (module === require.main) {
  main();
}

module.exports = {
main: main,
getRandomInt: getRandomInt,
insertCustomMetric: insertCustomMetric

};