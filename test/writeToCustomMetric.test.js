
/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const proxyquire = require(`proxyquire`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const test = require(`ava`);
const sinon = require(`sinon`);

const clientMock = {
  projectPath: sinon.stub().returns("projects/project_name"),
  createTimeSeries: sinon.stub().returns( Promise.resolve( [] ))
};

var program = proxyquire(`../writeToCustomMetric`, { client: clientMock });

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial("Fails without input parameters" , t => {
  const expectedMsg = "Usage: writeToCustomMetric.js [PROJECTID] [INSTANCEID] [ZONEID]";
  program.main([]);
  t.is(console.error.callCount, 1);  
  t.deepEqual(console.error.getCall(0).args, [ expectedMsg ] );
});

test.serial("Succeeds with proper input parameters", async (t) => {
  await program.insertCustomMetric([" ", " ","123456789","123456789","projects/project/zones/zone"]);
  t.is(console.log.callCount, 1); 
  t.is(console.error.callCount, 0);  
});
