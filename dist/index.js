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
  console.log("[addQuarantineSegmentToUrl]", url);
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
        grouped[prefix][defaultValue] = result; // Use "defaultValue" as key and "result" as value for "api" prefix
      } else if (prefix === "response") {
        // const defaultValue = valueObject.defaultValue.url;
        var _result = valueObject.result;
        // grouped[prefix][defaultValue] = result;

        grouped[prefix] = _extends({}, grouped[prefix], _result);
      } else if (prefix === "context") {
        var keyWithoutPrefix = parts.slice(1).join("-"); // Remove the prefix
        var _result2 = valueObject.result;
        console.log(keyWithoutPrefix, _result2, "contexttttttt");

        //   grouped[prefix][keyWithoutPrefix] = result; // Remove prefix and use "result" as value for other prefixes
        grouped = _extends({}, grouped, _result2);
        // grouped[prefix] = {
        //     ...grouped[prefix],
        //     ...result
        // }; // Remove prefix and use "result" as value for other prefixes
      }
    }
  }

  console.log(grouped, "yyyyyyyyyyyyyyyyyyyy");
  return grouped;
}

// Function to group objects based on prefix and structure  

var ABCProvider = function ABCProvider(_ref) {
  var children = _ref.children,
    getModel = _ref.getModel,
    updateModel = _ref.updateModel,
    model = _ref.model;
  var _getModel = getModel(["misc"]),
    _getModel$misc = _getModel.misc,
    iamABCTester = _getModel$misc.iamABCTester,
    abcScope = _getModel$misc.abcScope,
    abcEndpoint = _getModel$misc.abcEndpoint,
    abcEnable = _getModel$misc.abcEnable,
    abcSdk = _getModel$misc.abcSdk,
    _getModel$misc$abcTim = _getModel$misc.abcTimeout,
    abcTimeout = _getModel$misc$abcTim === void 0 ? 30000 : _getModel$misc$abcTim;
  console.log(iamABCTester, abcScope, abcSdk, "[ABCProvider] iamABCTester", abcEnable);
  var _useState = React.useState(false),
    isReady = _useState[0],
    setIsReady = _useState[1];
  var arrayChildren = React.Children.toArray(children);
  var gb = React.useMemo(function () {
    if (iamABCTester) {
      console.log(iamABCTester, "iamABCTesteriamABCTester useMemo");
      var _gb = new growthbookReact.GrowthBook({
        apiHost: abcEndpoint,
        //"https://growthbook-api-dev.maybanksandbox.com/",
        clientKey: abcSdk //"sdk-cAC7AQGd1GAEedY",
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
      gb.loadFeatures({
        timeout: abcTimeout
      }).then(function () {
        setIsReady(true);
      });
    }
  }, [model.misc.abcEnable, model.misc.iamABCTester]);
  var evaluateFeatures = function evaluateFeatures() {
    if (iamABCTester && model.misc.abcEnable) {
      allFeatures = gb.getFeatures();
      console.log(iamABCTester, "evaluateFeatures gbs", allFeatures);
      var done = {};
      Object.keys(allFeatures).map(function (key) {
        console.log(key, "inside itemmmmmmmz ;) ->>>>>", allFeatures[key]);
        var result = gb.getFeatureValue(key, allFeatures[key].defaultValue);
        done[key] = {
          defaultValue: allFeatures[key].defaultValue,
          result: result
        };
        console.log(key, result, "inside <<<<<<------ result");
      });
      console.log(done, "done itemmmmmmmz ;) result");

      // Call the function to group by prefix
      groupedData = groupByPrefixAndStructure(done);
      console.log("sssssssss group abc abc yasser", groupedData);
      updateModel(_extends({}, groupedData));
    }
  };
  React.useEffect(function () {
    if (!isReady) {
      return;
    }

    //   gb.setAttributes({
    //     did: "scope",
    //   });

    evaluateFeatures();
    console.log("evaluateFeatures");
  }, [isReady, model.misc.iamABCTester]);
  console.log("NavigationContainer mounted", iamABCTester);
  return (
    /*#__PURE__*/
    // !model.misc.abcEnable && renderChild() ||
    React__default["default"].createElement(growthbookReact.GrowthBookProvider, {
      growthbook: gb
    }, React.Children.map(arrayChildren, function (child, index) {
      console.log(index, "44444444444444");
      return React.cloneElement(child, {});
    }))
  );
};

// import styles from './styles.module.css'

// // export const ExampleComponent = ({ text }) => {
// //   return <div className={styles.test}>    yasser ;) Component: {text}</div>
// // }

// import React,
// {
//   useEffect,
//   useState,
//   useCallback,
//   Children, 
//   cloneElement
// } from 'react';
// import {
//   GrowthBook,
//   GrowthBookProvider,
//   useFeatureValue,
//   useFeatureIsOn,
//   useFeature,
//   useGrowthBook,
// } from "@growthbook/growthbook-react";
// // import CustomABC from "./CustomABC";

// // Create a GrowthBook instance
// const gb = new GrowthBook({
//   apiHost: "https://growthbook-api-dev.maybanksandbox.com",
//   clientKey: "sdk-cAC7AQGd1GAEedY",
//   // Enable easier debugging during development
//   enableDevMode: true,
//   // Update the instance in realtime as features change in GrowthBook
//   subscribeToChanges: true,
//   // Only required for A/B testing
//   // Called every time a user is put into an experiment
//   trackingCallback: (experiment, result) => {
//     console.log("Experiment Viewed", {
//       experimentId: experiment.key,
//       variationId: result.key,
//     });
//   },
//   onFeatureUsage: (featureKey, result) => {
//     console.log("feature", featureKey, "has value", result.value);
//   },
// });

// // Function to group objects based on prefix and structure
// function groupByPrefixAndStructure(data) {
//   let grouped = {};

//   for (const key in data) {
//     if (data.hasOwnProperty(key)) {
//       const parts = key.split("-");
//       const prefix = parts[0];
//       const valueObject = data[key];

//       if (!grouped[prefix]) {
//         grouped[prefix] = {};
//       }

//       // switch (prefix) {
//       //     case "api":
//       //         const defaultValue = valueObject.defaultValue;
//       //         // const result = valueObject.result;
//       //         grouped[prefix][defaultValue] = valueObject.result;
//       //         break;
//       //     case "response":
//       //         // const result = valueObject.result;
//       //         // grouped[prefix][defaultValue] = result;

//       //         grouped[prefix] = {
//       //             ...grouped[prefix],
//       //             ...valueObject.result,
//       //         };
//       //         break;

//       //     case "context":
//       //         const keyWithoutPrefix = parts.slice(1).join("-"); // Remove the prefix
//       //         // const result = valueObject.result;
//       //         //   grouped[prefix][keyWithoutPrefix] = result; // Remove prefix and use "result" as value for other prefixes
//       //         grouped = {
//       //             ...grouped,
//       //             ...valueObject.result,
//       //         };
//       //         break;

//       //     case "quarantine":
//       //         console.log(valueObject,"valueObject quarantine", valueObject.result)
//       //         grouped = {
//       //             ...grouped,
//       //             quarantine: "yasser"//valueObject.result && "true" || "false",
//       //         };

//       //         break;
//       // }

//       if (prefix === "api") {
//         const defaultValue = valueObject.defaultValue;
//         const result = valueObject.result;
//         grouped[prefix][defaultValue] = result; // Use "defaultValue" as key and "result" as value for "api" prefix
//       } else if (prefix === "response") {
//         // const defaultValue = valueObject.defaultValue.url;
//         const result = valueObject.result;
//         // grouped[prefix][defaultValue] = result;

//         grouped[prefix] = {
//           ...grouped[prefix],
//           ...result,
//         };
//       } else if (prefix === "context") {
//         const keyWithoutPrefix = parts.slice(1).join("-"); // Remove the prefix
//         const result = valueObject.result;
//         console.log(keyWithoutPrefix, result, "contexttttttt");

//         //   grouped[prefix][keyWithoutPrefix] = result; // Remove prefix and use "result" as value for other prefixes
//         grouped = {
//           ...grouped,
//           ...result,
//         };
//         // grouped[prefix] = {
//         //     ...grouped[prefix],
//         //     ...result
//         // }; // Remove prefix and use "result" as value for other prefixes
//       }
//     }
//   }

//   console.log(grouped, "yyyyyyyyyyyyy43424sss3yyyyyyy");
//   return grouped;
// }

// const ABCProvider = ({ children, getModel, updateModel, model }) => {

//   const {
//     misc: {
//       iamABCTester,
//     }
//   } = getModel([
//     "misc"
//   ]);

//   let allFeatures = {};
//   let groupedData = {};

//   console.log(iamABCTester,"iamABCTesteriamABCTester")

//   const [isReady, setIsReady] = useState(false);

//   const arrayChildren = Children.toArray(children);

//   useEffect(() => {
//     if(iamABCTester){
//       gb.loadFeatures().then(response => {
//         console.log('yasssereeeeee', response);
//         setIsReady(true);
//       })
//     }

//     // Load feature definitions from GrowthBook API
//     // fetch(
//     //   'https://growthbook-api-dev.maybanksandbox.com/api/features/sdk-cAC7AQGd1GAEedY',
//     // ).then(response => response.json())
//     //   .then(data => {
//     //     console.log('yassser', data)
//     //     gb.setFeatures(data.features);
//     //     updateLoaded(data.features)
//     //   })
//     //   .catch(error => console.error(error,'errrrorrororor'))
//     //   .finally(() => {
//     //     setIsReady(true);
//     //   });
//   }, [model.misc]);

//   const evaluateFeatures = () => {
//     allFeatures = gb.getFeatures();

//     console.log(iamABCTester,'evaluateFeatures gbs', allFeatures);

//     if (iamABCTester) {
//       // const growthbook = useGrowthBook();

//       // allFeatures = gb.getFeatures();
//       console.log(allFeatures, "evaluateFeatures gbs xyz");

//       let done = {};
//       Object.keys(allFeatures).map((key) => {
//         console.log(key, "inside itemmmmmmmz ;) ->>>>>",allFeatures[key]);
//         const result = gb.getFeatureValue(key, allFeatures[key].defaultValue);
//         done[key] = {
//           defaultValue: allFeatures[key].defaultValue,
//           result,
//         };
//         console.log(key, result, "inside <<<<<<------ result");
//       });

//       console.log(done, "done itemmmmmmmz ;) result");

//       // Call the function to group by prefix
//       groupedData = groupByPrefixAndStructure(done);

//       console.log("sssssssss group abc abc yasser", groupedData);
//       updateModel({...groupedData})
//     }
//   };

//   useEffect(() => {
//     if (!isReady) {
//       return;
//     }

//     gb.setAttributes({
//       did: "yasser",
//     });

//     evaluateFeatures();
//     console.log('evaluateFeatures');
//   }, [isReady, model.misc]);

//   console.log('NavigationContainer mounted', iamABCTester);

//   return (
//     <GrowthBookProvider growthbook={gb}>
//       {
//         Children.map(arrayChildren, (child, index) => {
//           console.log(index,'444444444444443')
//           return cloneElement(child, {
//             // isReady,
//           })
//         })
//       }
//     </GrowthBookProvider>
//   );
// };

// export default ABCProvider;

function responseInterceptor(_ref) {
  var getModel = _ref.getModel,
    response = _ref.response;
  // Modify the response data here mapUrls
  // const { getModel } = ApiManager.context.controller;
  try {
    var _getModel, _getModel2, _response;
    var dictionary = ((_getModel = getModel(["response"])) == null ? void 0 : _getModel.response) || {};
    var responseUrl = response.config.url;
    response = lodash.merge(response, mapUrls(responseUrl, dictionary));
    console.log("[responseInterceptor] Request URL:", responseUrl);
    console.log("[responseInterceptor] context", (_getModel2 = getModel(["response"])) == null ? void 0 : _getModel2.response);
    console.log("[responseInterceptor] data", (_response = response) == null ? void 0 : _response.data);
    return response;
  } catch (error) {
    console.log('[responseInterceptor]', error);
    return response;
  }
}
function requestInterceptor(_ref2) {
  var getModel = _ref2.getModel,
    request = _ref2.request;
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
      //merge existing header with new one
      // request.headers = mergeHeaders(request.headers, {
      //     ...requests?.headers,
      // });
    }

    console.log(requests, request == null ? void 0 : request.headers, requests == null ? void 0 : requests.enabled, request == null ? void 0 : request.url, "[requestInterceptor] details");
    return request;
  } catch (error) {
    console.log('[requestInterceptor] error:', error);
    return request;
  }
}

exports.ABCProvider = ABCProvider;
exports.requestInterceptor = requestInterceptor;
exports.responseInterceptor = responseInterceptor;
//# sourceMappingURL=index.js.map
