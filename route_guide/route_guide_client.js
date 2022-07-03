/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const PROTO_PATH = __dirname + '/../protos/route_guide.proto';

const { getRandomArbitrary } = require('./client/util');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;
const client = new routeguide.RouteGuide('localhost:50051',
                                       grpc.credentials.createInsecure());

const COORD_FACTOR = 1e7;

/**
 * Run the recordRoute demo. Sends randomly chosen points with 1s delay in between.
 * Prints the routeSummary when they are sent from the server.
 */
function runRecordRoute() {
  const call = client.recordRoute();

  call.on('data', function(stats) {
    console.log()
    console.log('Passed', stats.pointCount, 'points');
    console.log('Travelled', stats.distance, 'meters');
    console.log()
  });

  setInterval(function () {
    const rand_point = createRandomPoint()

    call.write(rand_point);

    console.log('Visiting point ' 
      + rand_point.latitude/COORD_FACTOR + ', '   
      + rand_point.longitude/COORD_FACTOR
    );
  }, 1000)


  //handle Ctrl + C
  call.on('end', function() {
    process.exit();
  });

  process.on('SIGINT', () => {
    console.log("\n\n Stop tracking");
    call.end();
  });
}

function createRandomPoint () {
  return {
    latitude: getRandomArbitrary(41000000, 42000000),
    longitude: getRandomArbitrary(-750000000, -740000000)
  }
}

runRecordRoute();
