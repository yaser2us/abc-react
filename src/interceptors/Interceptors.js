import { merge } from "lodash";

import {
    addQuarantineSegmentToUrl,
    mapUrls
} from "../tools"

function responseInterceptor({ getModel, response, debug = false }) {
    // Modify the response data here mapUrls
    try {
        const dictionary = getModel(["response"])?.response || {};
        const responseUrl = response.config.url;

        response = merge(response, mapUrls(responseUrl, dictionary));
        if (debug) {
            console.log("[responseInterceptor] Request URL:", responseUrl);
            console.log("[responseInterceptor] context", getModel(["response"])?.response);
            console.log("[responseInterceptor] data", response?.data);
        }
        return response;
    } catch (error) {
        if (debug) {
            console.log('[responseInterceptor]', error)
        }
        return response
    }
}
function requestInterceptor({ getModel, request, debug = false }) {
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
        }
        if (debug) {
            console.log(
                requests,
                request?.headers,
                requests?.enabled,
                request?.url,
                "[requestInterceptor] details"
            );
        }
        return request;
    } catch (error) {
        if (debug) {
            console.log('[requestInterceptor] error:', error)
        }
        return request
    }
}

export {
    requestInterceptor,
    responseInterceptor
}