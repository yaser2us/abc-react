!function(e,o){"object"==typeof exports&&"undefined"!=typeof module?o(exports,require("react"),require("@growthbook/growthbook-react"),require("url-parse"),require("lodash")):"function"==typeof define&&define.amd?define(["exports","react","@growthbook/growthbook-react","url-parse","lodash"],o):o((e||self).abcReact={},e.react,e.growthbookReact,e.urlParse,e.lodash)}(this,function(e,o,t,r,n){function l(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var a=/*#__PURE__*/l(r);function s(){return s=Object.assign?Object.assign.bind():function(e){for(var o=1;o<arguments.length;o++){var t=arguments[o];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e},s.apply(this,arguments)}function u(e,o){return o[e]?o[e]:e}e.ABCProvider=function(e){var r=e.children,n=e.updateModel,l=e.model,a=(0,e.getModel)(["misc"]).misc,u=a.iamABCTester,i=a.abcEndpoint,c=a.abcSdk,d=a.abcTimeout,f=void 0===d?3e4:d;console.log(u,a.abcScope,c,"[ABCProvider] iamABCTester",a.abcEnable);var p=o.useState(!1),g=p[0],m=p[1],y=o.Children.toArray(r),b=o.useMemo(function(){if(u)return console.log(u,"iamABCTesteriamABCTester useMemo"),new t.GrowthBook({apiHost:i,clientKey:c})},[i,u]);return o.useEffect(function(){u&&l.misc.abcEnable&&b.loadFeatures({timeout:f}).then(function(){m(!0)})},[l.misc.abcEnable,l.misc.iamABCTester]),o.useEffect(function(){g&&(function(){if(u&&l.misc.abcEnable){allFeatures=b.getFeatures(),console.log(u,"evaluateFeatures gbs",allFeatures);var e={};Object.keys(allFeatures).map(function(o){console.log(o,"inside itemmmmmmmz ;) ->>>>>",allFeatures[o]);var t=b.getFeatureValue(o,allFeatures[o].defaultValue);e[o]={defaultValue:allFeatures[o].defaultValue,result:t},console.log(o,t,"inside <<<<<<------ result")}),console.log(e,"done itemmmmmmmz ;) result"),groupedData=function(e){var o={};for(var t in e)if(e.hasOwnProperty(t)){var r=t.split("-"),n=r[0],l=e[t];if(o[n]||(o[n]={}),"api"===n)o[n][l.defaultValue]=l.result;else if("response"===n)o[n]=s({},o[n],l.result);else if("context"===n){var a=r.slice(1).join("-"),u=l.result;console.log(a,u,"contexttttttt"),o=s({},o,u)}}return console.log(o,"yyyyyyyyyyyyyyyyyyyy"),o}(e),console.log("sssssssss group abc abc yasser",groupedData),n(s({},groupedData))}}(),console.log("evaluateFeatures"))},[g,l.misc.iamABCTester]),console.log("NavigationContainer mounted",u),h(t.GrowthBookProvider,{growthbook:b},o.Children.map(y,function(e,t){return console.log(t,"44444444444444"),o.cloneElement(e,{})}))},e.requestInterceptor=function(e){var o=e.getModel,t=e.request;try{var r,n=(null==(r=o(["api"]))?void 0:r.api)||{},l=o("requests")||{enabled:!1,headers:{},prefix:""};return t.url=u(t.url,n),l.enabled&&(t.url=function(e,o){if(void 0===o&&(o=""),""===o)return e;var t=new a.default(e);return t.pathname="/"+o+(null==t?void 0:t.pathname),console.log("[addQuarantineSegmentToUrl]",t),t.toString()}(t.url,l.prefix)),console.log(l,null==t?void 0:t.headers,null==l?void 0:l.enabled,null==t?void 0:t.url,"[requestInterceptor] details"),t}catch(e){return console.log("[requestInterceptor] error:",e),t}},e.responseInterceptor=function(e){var o=e.getModel,t=e.response;try{var r,l,a,s=(null==(r=o(["response"]))?void 0:r.response)||{},i=t.config.url;return t=n.merge(t,u(i,s)),console.log("[responseInterceptor] Request URL:",i),console.log("[responseInterceptor] context",null==(l=o(["response"]))?void 0:l.response),console.log("[responseInterceptor] data",null==(a=t)?void 0:a.data),t}catch(e){return console.log("[responseInterceptor]",e),t}}});
//# sourceMappingURL=index.umd.js.map