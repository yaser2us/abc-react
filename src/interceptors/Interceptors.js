import { get, merge } from "lodash";

import {
    mergeHeaders,
    addQuarantineSegmentToUrl,
    mapUrls
} from "../tools"

function responseInterceptor({ getModel, response }) {
    // Modify the response data here mapUrls
    // const { getModel } = ApiManager.context.controller;
    try {
        const dictionary = getModel(["response"])?.response || {};
        const responseUrl = response.config.url;

        response = merge(response, mapUrls(responseUrl, dictionary));
        console.log("[responseInterceptor] Request URL:", responseUrl);
        console.log("[responseInterceptor] context", getModel(["response"])?.response);
        console.log("[responseInterceptor] data", response?.data);
        return response;
    } catch(error) {
        console.log('[responseInterceptor]', error)
        return response
    }
}
function requestInterceptor({ getModel, request }) {
    // Modify the response data here mapUrls
    try {
        const dictionary = getModel(["api"])?.api || {};
        const requests = getModel("requests") || {
            //to check whether 
            //requires merging the header for request or not
            enabled: false,
            headers: {},
            //the prefix to be merged with endpoint path
            //example: www.domain.com/prefix/api/example
            prefix: "",
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
        console.log(
            requests,
            request?.headers,
            requests?.enabled,
            request?.url,
            "[requestInterceptor] details"
        );
        return request;
    } catch(error) {
        console.log('[requestInterceptor] error:',error)
        return request
    }
}

export {
    requestInterceptor,
    responseInterceptor
}