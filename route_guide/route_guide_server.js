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

const { getDistance } = require('./server/util')
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

/**
 * recordRoute handler. Gets a stream of points, and responds with statistics
 * about the "trip": number of points, total distance traveled
 * @param {Duplex} call The request point stream.
 */
function recordRoute(call) {
  const routeSummary = {
    pointCount: 0,
    distance: 0,
    previous: null
  }

  call.on('data', function(point) {
    routeSummary.pointCount += 1;
    
    if (routeSummary.previous != null) {
      routeSummary.distance += getDistance(routeSummary.previous, point);
    }

    routeSummary.previous = point;
  });

  setInterval(function () {
    call.write({
      pointCount: routeSummary.pointCount,
      distance: routeSummary.distance
    })
  }, 3000)

  call.on('end', function() {
    call.write(routeSummary)
    call.end();
  });
}

/**
 * Get a new server with the handler functions in this file bound to the methods
 * it serves.
 * @return {Server} The new server object
 */
function getServer() {
  const server = new grpc.Server();
  server.addService(routeguide.RouteGuide.service, {
    recordRoute,
  });
  return server;
}

// If this is run as a script, start a server on an unused port
const routeServer = getServer();
routeServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  routeServer.start();
});
