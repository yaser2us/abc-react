import React, { useState, Children, useMemo, useEffect, cloneElement } from 'react';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import { merge } from 'lodash';
import URL from 'url-parse';
import fetchIntercept from 'fetch-intercept';

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
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

class FetchInterceptor {
  constructor(getModel, debug = true) {
    this.unregister = fetchIntercept.register({
      response: async function (response) {
        // Modify the reponse object
        console.log('[responseInterceptor] [fetch] response', response);
        try {
          var _getModel, _response;
          const dictionary = ((_getModel = getModel(["response"])) == null ? void 0 : _getModel.response) || {};
          const responseUrl = response.url;
          const r = await ((_response = response) == null ? void 0 : _response.json());
          response = merge(r, mapUrls(responseUrl, dictionary));
          if (debug) {
            console.log("[responseInterceptor] [fetch] mapUrls:", mapUrls(responseUrl, dictionary));
            console.log("[responseInterceptor] [fetch] Request URL:", responseUrl);
            console.log("[responseInterceptor] [fetch] context", getModel("response"));
            console.log("[responseInterceptor] [fetch] data", r);
          }
          return response;
        } catch (error) {
          if (debug) {
            console.log('[responseInterceptor] [fetch] error', error);
          }
          return response;
        }
      },
      request: function (url, config) {
        // Modify the url or config here
        console.log(url, config, '[requestInterceptor] [fetch] request');
        let newUrl = url;
        try {
          var _getModel2;
          const dictionary = ((_getModel2 = getModel(["api"])) == null ? void 0 : _getModel2.api) || {};
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
          newUrl = mapUrls(newUrl, dictionary);
          if (requests.enabled) {
            //merge prefix with url
            newUrl = addQuarantineSegmentToUrl(newUrl, requests.prefix);
          }
          if (debug) {
            console.log(requests, config == null ? void 0 : config.headers, requests == null ? void 0 : requests.enabled, url, newUrl, "[requestInterceptor] [fetch] details");
          }
          return [newUrl, config];
        } catch (error) {
          if (debug) {
            console.log('[requestInterceptor] [fetch] error:', error);
          }
          return [url, config];
        }
      },
      requestError: function (error) {
        // Called when an error occured during another 'request' interceptor call
        return Promise.reject(error);
      },
      responseError: function (error) {
        // Handle an fetch error
        return Promise.reject(error);
      }
    });
  }
  unRegister() {
    return this.unregister;
  }
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
  var _model$misc, _model$misc5, _model$misc6, _model$misc8;
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
  console.log('apcProvider', model == null || (_model$misc = model.misc) == null || (_model$misc = _model$misc.abcTesting) == null ? void 0 : _model$misc.abcEnable, iamABCTester);
  const [isReady, setIsReady] = useState(false);
  const arrayChildren = Children.toArray(children);
  const gb = useMemo(() => {
    var _model$misc2;
    if (iamABCTester && model != null && (_model$misc2 = model.misc) != null && (_model$misc2 = _model$misc2.abcTesting) != null && _model$misc2.abcEnable) {
      new FetchInterceptor(getModel, true);
      // console.log(iamABCTester, "iamABCTesteriamABCTester useMemo");
      const gb = new GrowthBook({
        apiHost: abcEndpoint,
        clientKey: abcSdk
        // Enable easier debugging during development
        // enableDevMode: true,
        // Update the instance in realtime as features change in GrowthBook
        // subscribeToChanges: true,
        // Only required for A/B testing
        // Called every time a user is put into an experiment
        // trackingCallback: (experiment, result) => {
        //   console.log("Experiment Viewed", {
        //     experimentId: experiment.key,
        //     variationId: result.key,
        //   });
        // },
        // onFeatureUsage: (featureKey, result) => {
        //   console.log("feature", featureKey, "has value", result.value);
        // },
      });

      return gb;
    }
  }, [abcEndpoint, iamABCTester]);
  useEffect(() => {
    var _model$misc3, _model$misc4;
    if (model != null && (_model$misc3 = model.misc) != null && (_model$misc3 = _model$misc3.abcTesting) != null && _model$misc3.iamABCTester && model != null && (_model$misc4 = model.misc) != null && (_model$misc4 = _model$misc4.abcTesting) != null && _model$misc4.abcEnable) {
      if (analytic && analytic instanceof Function) {
        try {
          logEvent(_eventType, {
            [_eventName]: _eventValue
          });
        } catch (error) {
          if (_debug) {
            console.log(error);
          }
        }
      }
      gb.loadFeatures({
        timeout: abcTimeout
      }).then(() => {
        setIsReady(true);
      });
      gb.setAttributes(_extends({}, abcDefaultAttributes, {
        scope: abcScope
      }));
    }
  }, [model == null || (_model$misc5 = model.misc) == null || (_model$misc5 = _model$misc5.abcTesting) == null ? void 0 : _model$misc5.abcEnable, model == null || (_model$misc6 = model.misc) == null || (_model$misc6 = _model$misc6.abcTesting) == null ? void 0 : _model$misc6.iamABCTester]);
  const evaluateFeatures = () => {
    var _model$misc7;
    if (iamABCTester && model != null && (_model$misc7 = model.misc) != null && (_model$misc7 = _model$misc7.abcTesting) != null && _model$misc7.abcEnable) {
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
        updateModel(_extends({}, groupedData));
      } catch (error) {
        if (_debug) {
          console.log(error);
        }
      }
    }
  };
  useEffect(() => {
    if (!isReady) {
      return;
    }
    evaluateFeatures();
  }, [isReady, model == null || (_model$misc8 = model.misc) == null || (_model$misc8 = _model$misc8.abcTesting) == null ? void 0 : _model$misc8.iamABCTester]);
  return /*#__PURE__*/React.createElement(GrowthBookProvider, {
    growthbook: gb
  }, Children.map(arrayChildren, child => {
    return cloneElement(child, {});
  }));
};

export { ABCProvider, requestInterceptor, responseInterceptor };
//# sourceMappingURL=index.modern.mjs.map
