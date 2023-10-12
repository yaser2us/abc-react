var React = require('react');
var growthbookReact = require('@growthbook/growthbook-react');
var URL = require('url-parse');
var lodash = require('lodash');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var URL__default = /*#__PURE__*/_interopDefaultLegacy(URL);

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
      } else if (prefix === "response") {
        var _result = valueObject.result;
        grouped[prefix] = _extends({}, grouped[prefix], _result);
      } else if (prefix === "context") {
        var _result2 = valueObject.result;
        grouped = _extends({}, grouped, _result2);
      }
    }
  }
  return grouped;
}

var ABCProvider = function ABCProvider(_ref) {
  var children = _ref.children,
    getModel = _ref.getModel,
    updateModel = _ref.updateModel,
    model = _ref.model,
    analytic = _ref.analytic,
    _ref$debug = _ref.debug,
    debug = _ref$debug === void 0 ? false : _ref$debug;
  var _getModel = getModel(["misc"]),
    _getModel$misc = _getModel.misc,
    iamABCTester = _getModel$misc.iamABCTester,
    abcScope = _getModel$misc.abcScope,
    abcEndpoint = _getModel$misc.abcEndpoint,
    abcSdk = _getModel$misc.abcSdk,
    _getModel$misc$abcTim = _getModel$misc.abcTimeout,
    abcTimeout = _getModel$misc$abcTim === void 0 ? 30000 : _getModel$misc$abcTim,
    _getModel$misc$abcDef = _getModel$misc.abcDefaultAttributes,
    abcDefaultAttributes = _getModel$misc$abcDef === void 0 ? {} : _getModel$misc$abcDef;

  // console.log(iamABCTester, abcScope, abcSdk, "[ABCProvider] iamABCTester", abcEnable);

  var _useState = React.useState(false),
    isReady = _useState[0],
    setIsReady = _useState[1];
  var arrayChildren = React.Children.toArray(children);
  var gb = React.useMemo(function () {
    if (iamABCTester) {
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
    if (iamABCTester && model.misc.abcEnable) {
      if (analytic && analytic instanceof Function) {
        try {
          logEvent("view_screen", {
            "screen_name": "abc-platform"
          });
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
    }
  }, [model.misc.abcEnable, model.misc.iamABCTester]);
  var evaluateFeatures = function evaluateFeatures() {
    if (iamABCTester && model.misc.abcEnable) {
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
    }
  };
  React.useEffect(function () {
    if (!isReady) {
      return;
    }
    gb.setAttributes(_extends({}, abcDefaultAttributes, {
      scope: abcScope
    }));
    evaluateFeatures();
  }, [isReady, model.misc.iamABCTester]);
  return /*#__PURE__*/React__default["default"].createElement(growthbookReact.GrowthBookProvider, {
    growthbook: gb
  }, React.Children.map(arrayChildren, function (child) {
    return React.cloneElement(child, {});
  }));
};

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

exports.ABCProvider = ABCProvider;
exports.requestInterceptor = requestInterceptor;
exports.responseInterceptor = responseInterceptor;
//# sourceMappingURL=index.js.map
