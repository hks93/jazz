// =========================================================================
// Copyright ©  2017 T-Mobile USA, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// =========================================================================

/**
Nodejs Template Project
@author:
@version: 1.0
 **/
'use strict';
const errorHandlerModule = require("./components/error-handler.js"); //Import the error codes module.
const responseObj = require("./components/response.js"); //Import the response module.
const configObj = require("./components/config.js"); //Import the environment data.
const logger = require("./components/logger.js"); //Import the logging module.
const validateARN = require("./components/validate-arn.js");
const aws = require('aws-sdk');
var handler = (event, context, cb) => {

  //Initializations
  var errorHandler = errorHandlerModule();
  var config = configObj(event);
  logger.init(event, context);
  var AWS_REGION;
  try {
    var testResponse = {
      "StatusCode": 200,
      "execStatus": 0
    };
    if (event && event.method && event.method === 'POST') {
      if (!event.body) {
        return cb(JSON.stringify(errorHandler.throwInputValidationError("Event Body not Defined")));
      } else if (!validateARN(event.body.functionARN)) {
        return cb(JSON.stringify(errorHandler.throwInputValidationError("Function ARN is invalid")));
      } else if (!event.body.inputJSON) {
        return cb(JSON.stringify(errorHandler.throwInputValidationError("Input for function is not defined")));
      } else {
        var functionARN = event.body.functionARN;
        var arnvalues = functionARN.split(":");
        AWS_REGION =  arnvalues[3];//["arn","aws","lambda","us-east-1","000000""] spliting FunctionARN to get the aws-region 
        var inputJSON = JSON.parse(event.body.inputJSON);
        invokeLambda(functionARN, inputJSON, AWS_REGION).then((data) => {
          if (data && data.StatusCode === 200) {
            testResponse.execStatus = 1; // Test Succesfull
          }
          return cb(null, responseObj(testResponse, event.body)); // Test Failed 
        }).catch((err) => {
          logger.info(" TEST FAILED  : " + JSON.stringify(err));
          return cb(null, responseObj(testResponse, event.body)); // Test Failed 
        });
      }
    }
    return cb( JSON.stringify(errorHandler.throwNotFoundError("Method not found")))
  } catch (err) {
    logger.error("Failed to invoke lambda : " + JSON.stringify(err));
    return cb(JSON.stringify(errorHandler.throwInternalServerError("Failed to invoke lambda")));
  }

};

var invokeLambda = (functionARN, inputJSON, AWS_REGION) => {
  return new Promise((resolve, reject) => {
    try {  
      var lambda = new aws.Lambda({
        region: AWS_REGION 
      });
      lambda.invoke({
        FunctionName: functionARN,
        Payload: JSON.stringify(inputJSON, null, 2)
      }, function (error, data) {
        if (error) {
          logger.error(error);
          reject(error);
        } else if (data.Payload) {
          logger.info(data);
          resolve(data);
        }
      });
    } catch (e) {
      logger.error(e);
      reject("Error in invoking Lambda");

    }
  });
};
module.exports = {
  handler: handler,
  invokeLambda: invokeLambda
};