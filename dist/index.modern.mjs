import React, { useState, Children, useMemo, useEffect, cloneElement } from 'react';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import URL from 'url-parse';
import { merge } from 'lodash';

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}

function mapUrls(url, urlMappings) {
  if (urlMappings[url]) {
    return urlMappings[url];
  }
  return url;
}
function addQuarantineSegmentToUrl(originalUrl, quarantineSegment = "") {
  if (quarantineSegment === "") return originalUrl;

  // Parse the original URL
  const url = new URL(originalUrl);

  // Insert the quarantine segment after the domain in the pathname
  url.pathname = `/${quarantineSegment}${url == null ? void 0 : url.pathname}`;
  // Get the modified URL
  const modifiedUrl = url.toString();
  return modifiedUrl;
}
function groupByPrefixAndStructure(data) {
  let grouped = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const parts = key.split("-");
      const prefix = parts[0];
      const valueObject = data[key];
      if (!grouped[prefix]) {
        grouped[prefix] = {};
      }
      if (prefix === "api") {
        const defaultValue = valueObject.defaultValue;
        const result = valueObject.result;
        // Use "defaultValue" as key and "result" as value for "api" prefix
        grouped[prefix][defaultValue] = result;
      } else if (prefix === "response" || prefix === "navigation") {
        const result = valueObject.result;
        grouped[prefix] = _extends({}, grouped[prefix], result);
      } else if (prefix === "context") {
        const result = valueObject.result;
        grouped = _extends({}, grouped, result);
      }
    }
  }
  return grouped;
}

const ABCProvider = ({
  children,
  getModel,
  updateModel,
  model,
  analytic,
  debug: _debug = false,
  event: {
    eventType: _eventType = "view_screen",
    eventName: _eventName = "screen_name",
    eventValue: _eventValue = "abc-platform"
  } = {}
}) => {
  var _model$misc4, _model$misc5, _model$misc7;
  const {
    misc: {
      abcTesting: {
        iamABCTester = false,
        abcScope = 888888,
        abcEndpoint,
        // abcEnable,
        abcSdk,
        abcTimeout = 30000,
        abcDefaultAttributes = {}
      } = {}
    }
  } = getModel(["misc"]);
  const [isReady, setIsReady] = useState("FALSE");
  const arrayChildren = Children.toArray(children);
  const gb = useMemo(() => {
    var _model$misc;
    if (iamABCTester && model != null && (_model$misc = model.misc) != null && (_model$misc = _model$misc.abcTesting) != null && _model$misc.abcEnable) {
      // console.log(iamABCTester, "iamABCTesteriamABCTester useMemo");
      const gb = new GrowthBook({
        apiHost: abcEndpoint,
        clientKey: abcSdk,
        // Enable easier debugging during development
        // enableDevMode: true,
        // Update the instance in realtime as features change in GrowthBook
        // subscribeToChanges: true,
        // Only required for A/B testing
        // Called every time a user is put into an experiment
        trackingCallback: (experiment, result) => {
          if (analytic && analytic instanceof Function) {
            try {
              console.log("[abc] abc-experiment-done", {
                experimentId: experiment.key,
                variationId: result.key
              });
              analytic("abc-experiment-done", {
                experimentId: experiment == null ? void 0 : experiment.key,
                variationId: result == null ? void 0 : result.key
              });
            } catch (error) {
              if (_debug) {
                console.log('[abc]', error);
              }
            }
          }
        }
        // onFeatureUsage: (featureKey, result) => {
        //   console.log("feature", featureKey, "has value", result.value);
        // },
      });
      return gb;
    }
  }, [abcEndpoint, iamABCTester]);
  useEffect(() => {
    var _model$misc2, _model$misc3;
    if (model != null && (_model$misc2 = model.misc) != null && (_model$misc2 = _model$misc2.abcTesting) != null && _model$misc2.iamABCTester && model != null && (_model$misc3 = model.misc) != null && (_model$misc3 = _model$misc3.abcTesting) != null && _model$misc3.abcEnable) {
      if (analytic && analytic instanceof Function) {
        try {
          analytic(_eventType, {
            [_eventName]: _eventValue
          });
        } catch (error) {
          if (_debug) {
            console.log('[abc]', error);
          }
        }
      }
      gb.init({
        timeout: abcTimeout
      }).then(() => {
        setIsReady(Date.now());
      });
      gb.setAttributes(_extends({}, abcDefaultAttributes, (model == null ? void 0 : model.user) && model.user || {}, (model == null ? void 0 : model.cohort) && (model == null ? void 0 : model.cohort) || {}, {
        scope: abcScope
      }));
    }
  }, [model == null || (_model$misc4 = model.misc) == null || (_model$misc4 = _model$misc4.abcTesting) == null ? void 0 : _model$misc4.abcEnable, model == null || (_model$misc5 = model.misc) == null || (_model$misc5 = _model$misc5.abcTesting) == null ? void 0 : _model$misc5.iamABCTester, model == null ? void 0 : model.user, model == null ? void 0 : model.cohort]);
  const evaluateFeatures = () => {
    var _model$misc6;
    if (iamABCTester && model != null && (_model$misc6 = model.misc) != null && (_model$misc6 = _model$misc6.abcTesting) != null && _model$misc6.abcEnable) {
      try {
        const allFeatures = gb.getFeatures();
        let done = {};
        Object.keys(allFeatures).map(key => {
          const result = gb.getFeatureValue(key, allFeatures[key].defaultValue);
          done[key] = {
            defaultValue: allFeatures[key].defaultValue,
            result
          };
        });

        // Call the function to group by prefix
        const groupedData = groupByPrefixAndStructure(done);

        // updateModel({ ...groupedData });
        updateModel({
          "testValue": "hello"
        });
      } catch (error) {
        if (_debug) {
          console.log('[abc]', error);
        }
      }
    }
  };
  useEffect(() => {
    if (Boolean(isReady === "FALSE")) {
      return;
    }
    evaluateFeatures();
  }, [isReady, model == null || (_model$misc7 = model.misc) == null || (_model$misc7 = _model$misc7.abcTesting) == null ? void 0 : _model$misc7.iamABCTester]);
  return /*#__PURE__*/React.createElement(GrowthBookProvider, {
    growthbook: gb
  }, Children.map(arrayChildren, child => {
    return cloneElement(child, {});
  }));
};

function responseInterceptor({
  getModel,
  response,
  debug = false
}) {
  // Modify the response data here mapUrls
  try {
    var _getModel;
    const dictionary = ((_getModel = getModel(["response"])) == null ? void 0 : _getModel.response) || {};
    const responseUrl = response.config.url;
    response = merge(response, mapUrls(responseUrl, dictionary));
    if (debug) {
      var _getModel2, _response;
      console.log("[responseInterceptor] Request URL:", responseUrl);
      console.log("[responseInterceptor] context", (_getModel2 = getModel(["response"])) == null ? void 0 : _getModel2.response);
      console.log("[responseInterceptor] data", (_response = response) == null ? void 0 : _response.data);
    }
    return response;
  } catch (error) {
    if (debug) {
      console.log('[responseInterceptor]', error);
    }
    return response;
  }
}
function requestInterceptor({
  getModel,
  request,
  debug = false
}) {
  // Modify the response data here mapUrls
  try {
    var _getModel3;
    const dictionary = ((_getModel3 = getModel(["api"])) == null ? void 0 : _getModel3.api) || {};
    const requests = getModel("requests") || {
      //to check whether 
      //requires merging the header for request or not
      enabled: false,
      headers: {},
      //the prefix to be merged with endpoint path
      //example: www.domain.com/prefix/api/example
      prefix: ""
    };

    //to replace the url with alternative from abc
    request.url = mapUrls(request.url, dictionary);
    if (requests.enabled) {
      //merge prefix with url
      request.url = addQuarantineSegmentToUrl(request.url, requests.prefix);
    }
    if (debug) {
      console.log(requests, request == null ? void 0 : request.headers, requests == null ? void 0 : requests.enabled, request == null ? void 0 : request.url, "[requestInterceptor] details");
    }
    return request;
  } catch (error) {
    if (debug) {
      console.log('[requestInterceptor] error:', error);
    }
    return request;
  }
}

export { ABCProvider, requestInterceptor, responseInterceptor };
//# sourceMappingURL=index.modern.mjs.map
