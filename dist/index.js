var React = require('react');
var growthbookReact = require('@growthbook/growthbook-react');
var lodash = require('lodash');
var URL = require('url-parse');
var fetchIntercept = require('fetch-intercept');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var URL__default = /*#__PURE__*/_interopDefaultLegacy(URL);
var fetchIntercept__default = /*#__PURE__*/_interopDefaultLegacy(fetchIntercept);

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
function addQuarantineSegmentToUrl(originalUrl, quarantineSegment) {
  if (quarantineSegment === void 0) {
    quarantineSegment = "";
  }
  if (quarantineSegment === "") return originalUrl;

  // Parse the original URL
  var url = new URL__default["default"](originalUrl);

  // Insert the quarantine segment after the domain in the pathname
  url.pathname = "/" + quarantineSegment + (url == null ? void 0 : url.pathname);
  // Get the modified URL
  var modifiedUrl = url.toString();
  return modifiedUrl;
}
function groupByPrefixAndStructure(data) {
  var grouped = {};
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      var parts = key.split("-");
      var prefix = parts[0];
      var valueObject = data[key];
      if (!grouped[prefix]) {
        grouped[prefix] = {};
      }
      if (prefix === "api") {
        var defaultValue = valueObject.defaultValue;
        var result = valueObject.result;
        // Use "defaultValue" as key and "result" as value for "api" prefix
        grouped[prefix][defaultValue] = result;
      } else if (prefix === "response" || prefix === "navigation") {
        var _result3 = valueObject.result;
        grouped[prefix] = _extends({}, grouped[prefix], _result3);
      } else if (prefix === "context") {
        var _result4 = valueObject.result;
        grouped = _extends({}, grouped, _result4);
      }
    }
  }
  return grouped;
}

function responseInterceptor(_ref) {
  var getModel = _ref.getModel,
    response = _ref.response,
    _ref$debug = _ref.debug,
    debug = _ref$debug === void 0 ? false : _ref$debug;
  // Modify the response data here mapUrls
  try {
    var _getModel;
    var dictionary = ((_getModel = getModel(["response"])) == null ? void 0 : _getModel.response) || {};
    var responseUrl = response.config.url;
    response = lodash.merge(response, mapUrls(responseUrl, dictionary));
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
function requestInterceptor(_ref2) {
  var getModel = _ref2.getModel,
    request = _ref2.request,
    _ref2$debug = _ref2.debug,
    debug = _ref2$debug === void 0 ? false : _ref2$debug;
  // Modify the response data here mapUrls
  try {
    var _getModel3;
    var dictionary = ((_getModel3 = getModel(["api"])) == null ? void 0 : _getModel3.api) || {};
    var requests = getModel("requests") || {
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

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
var FetchInterceptor = /*#__PURE__*/function () {
  function FetchInterceptor(getModel, debug) {
    if (debug === void 0) {
      debug = true;
    }
    this.unregister = fetchIntercept__default["default"].register({
      response: function response(_response) {
        try {
          // Modify the reponse object
          console.log('[responseInterceptor] [fetch] response', _response);
          return Promise.resolve(_catch(function () {
            var _getModel, _response2;
            var dictionary = ((_getModel = getModel(["response"])) == null ? void 0 : _getModel.response) || {};
            var responseUrl = _response.url;
            return Promise.resolve((_response2 = _response) == null ? void 0 : _response2.json()).then(function (r) {
              _response = lodash.merge(r, mapUrls(responseUrl, dictionary));
              if (debug) {
                console.log("[responseInterceptor] [fetch] mapUrls:", mapUrls(responseUrl, dictionary));
                console.log("[responseInterceptor] [fetch] Request URL:", responseUrl);
                console.log("[responseInterceptor] [fetch] context", getModel("response"));
                console.log("[responseInterceptor] [fetch] data", r);
              }
              return _response;
            });
          }, function (error) {
            if (debug) {
              console.log('[responseInterceptor] [fetch] error', error);
            }
            return _response;
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      },
      request: function request(url, config) {
        // Modify the url or config here
        console.log(url, config, '[requestInterceptor] [fetch] request');
        var newUrl = url;
        try {
          var _getModel2;
          var dictionary = ((_getModel2 = getModel(["api"])) == null ? void 0 : _getModel2.api) || {};
          var requests = getModel("requests") || {
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
      requestError: function requestError(error) {
        // Called when an error occured during another 'request' interceptor call
        return Promise.reject(error);
      },
      responseError: function responseError(error) {
        // Handle an fetch error
        return Promise.reject(error);
      }
    });
  }
  var _proto = FetchInterceptor.prototype;
  _proto.unRegister = function unRegister() {
    return this.unregister;
  };
  return FetchInterceptor;
}();

var ABCProvider = function ABCProvider(_ref) {
  var _model$misc, _model$misc5, _model$misc6, _model$misc8;
  var children = _ref.children,
    getModel = _ref.getModel,
    updateModel = _ref.updateModel,
    model = _ref.model,
    analytic = _ref.analytic,
    _ref$debug = _ref.debug,
    debug = _ref$debug === void 0 ? false : _ref$debug,
    _ref$event = _ref.event,
    _ref$event2 = _ref$event === void 0 ? {} : _ref$event,
    _ref$event2$eventType = _ref$event2.eventType,
    eventType = _ref$event2$eventType === void 0 ? "view_screen" : _ref$event2$eventType,
    _ref$event2$eventName = _ref$event2.eventName,
    eventName = _ref$event2$eventName === void 0 ? "screen_name" : _ref$event2$eventName,
    _ref$event2$eventValu = _ref$event2.eventValue,
    eventValue = _ref$event2$eventValu === void 0 ? "abc-platform" : _ref$event2$eventValu;
  var _getModel = getModel(["misc"]),
    _getModel$misc$abcTes = _getModel.misc.abcTesting,
    _getModel$misc$abcTes2 = _getModel$misc$abcTes === void 0 ? {} : _getModel$misc$abcTes,
    _getModel$misc$abcTes3 = _getModel$misc$abcTes2.iamABCTester,
    iamABCTester = _getModel$misc$abcTes3 === void 0 ? false : _getModel$misc$abcTes3,
    _getModel$misc$abcTes4 = _getModel$misc$abcTes2.abcScope,
    abcScope = _getModel$misc$abcTes4 === void 0 ? 888888 : _getModel$misc$abcTes4,
    abcEndpoint = _getModel$misc$abcTes2.abcEndpoint,
    abcSdk = _getModel$misc$abcTes2.abcSdk,
    _getModel$misc$abcTes5 = _getModel$misc$abcTes2.abcTimeout,
    abcTimeout = _getModel$misc$abcTes5 === void 0 ? 30000 : _getModel$misc$abcTes5,
    _getModel$misc$abcTes6 = _getModel$misc$abcTes2.abcDefaultAttributes,
    abcDefaultAttributes = _getModel$misc$abcTes6 === void 0 ? {} : _getModel$misc$abcTes6;
  console.log('apcProvider', model == null || (_model$misc = model.misc) == null || (_model$misc = _model$misc.abcTesting) == null ? void 0 : _model$misc.abcEnable, iamABCTester);
  var _useState = React.useState(false),
    isReady = _useState[0],
    setIsReady = _useState[1];
  var arrayChildren = React.Children.toArray(children);
  var gb = React.useMemo(function () {
    var _model$misc2;
    if (iamABCTester && model != null && (_model$misc2 = model.misc) != null && (_model$misc2 = _model$misc2.abcTesting) != null && _model$misc2.abcEnable) {
      new FetchInterceptor(getModel, true);
      // console.log(iamABCTester, "iamABCTesteriamABCTester useMemo");
      var _gb = new growthbookReact.GrowthBook({
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

      return _gb;
    }
  }, [abcEndpoint, iamABCTester]);
  React.useEffect(function () {
    var _model$misc3, _model$misc4;
    if (model != null && (_model$misc3 = model.misc) != null && (_model$misc3 = _model$misc3.abcTesting) != null && _model$misc3.iamABCTester && model != null && (_model$misc4 = model.misc) != null && (_model$misc4 = _model$misc4.abcTesting) != null && _model$misc4.abcEnable) {
      if (analytic && analytic instanceof Function) {
        try {
          var _logEvent;
          logEvent(eventType, (_logEvent = {}, _logEvent[eventName] = eventValue, _logEvent));
        } catch (error) {
          if (debug) {
            console.log(error);
          }
        }
      }
      gb.loadFeatures({
        timeout: abcTimeout
      }).then(function () {
        setIsReady(true);
      });
      gb.setAttributes(_extends({}, abcDefaultAttributes, {
        scope: abcScope
      }));
    }
  }, [model == null || (_model$misc5 = model.misc) == null || (_model$misc5 = _model$misc5.abcTesting) == null ? void 0 : _model$misc5.abcEnable, model == null || (_model$misc6 = model.misc) == null || (_model$misc6 = _model$misc6.abcTesting) == null ? void 0 : _model$misc6.iamABCTester]);
  var evaluateFeatures = function evaluateFeatures() {
    var _model$misc7;
    if (iamABCTester && model != null && (_model$misc7 = model.misc) != null && (_model$misc7 = _model$misc7.abcTesting) != null && _model$misc7.abcEnable) {
      try {
        var allFeatures = gb.getFeatures();
        var done = {};
        Object.keys(allFeatures).map(function (key) {
          var result = gb.getFeatureValue(key, allFeatures[key].defaultValue);
          done[key] = {
            defaultValue: allFeatures[key].defaultValue,
            result: result
          };
        });

        // Call the function to group by prefix
        var groupedData = groupByPrefixAndStructure(done);
        updateModel(_extends({}, groupedData));
      } catch (error) {
        if (debug) {
          console.log(error);
        }
      }
    }
  };
  React.useEffect(function () {
    if (!isReady) {
      return;
    }
    evaluateFeatures();
  }, [isReady, model == null || (_model$misc8 = model.misc) == null || (_model$misc8 = _model$misc8.abcTesting) == null ? void 0 : _model$misc8.iamABCTester]);
  return /*#__PURE__*/React__default["default"].createElement(growthbookReact.GrowthBookProvider, {
    growthbook: gb
  }, React.Children.map(arrayChildren, function (child) {
    return React.cloneElement(child, {});
  }));
};

exports.ABCProvider = ABCProvider;
exports.requestInterceptor = requestInterceptor;
exports.responseInterceptor = responseInterceptor;
//# sourceMappingURL=index.js.map
