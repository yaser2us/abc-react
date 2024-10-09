import URL from "url-parse";

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
    url.pathname = `/${quarantineSegment}${url?.pathname}`;
    // Get the modified URL
    const modifiedUrl = url.toString();

    return modifiedUrl;
}

function mergeHeaders(originalHeaders = {}, newHeaders = {}) {
    // Get the modified headers
    const modifiedHeaders = merge(originalHeaders, newHeaders);
    return modifiedHeaders;
}

function mergeDeep(target, source) {
    for (let key in source) {
        // If both target and source have the same key, and their values are objects, merge them recursively
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], mergeDeep(target[key], source[key]));
        }
    }
    // Merge source into target
    return Object.assign(target || {}, source);
}

function groupByPrefixAndStructureV1(data) {
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
            } else if (prefix === "response") {
                const result = valueObject.result;

                grouped[prefix] = {
                    ...grouped[prefix],
                    ...result,
                };
            } else if (prefix === "context") {
                const result = valueObject.result;

                grouped = {
                    ...grouped,
                    ...result,
                };
            }
        }
    }

    return grouped;
}

function groupByPrefixAndStructure(data) {

    console.log("this data: ", JSON.stringify(data, null, 0));
    
    let grouped = {};

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const parts = key.split("-");
            const prefix = parts[0];
            const valueObject = data[key];

            if (!grouped[prefix]) {
                grouped[prefix] = {};
            }

            const defaultValue = valueObject.defaultValue;
            const result = valueObject.result;

            if (prefix === "api") {
                // Use "defaultValue" as key and "result" as value for "api" prefix
                grouped[prefix][defaultValue] = result;
            } else if (prefix === "response" || prefix === "navigation") {
                grouped[prefix] = {
                    ...grouped[prefix],
                    ...result,
                };
            } else if (prefix === "context") {
                grouped[prefix] = mergeDeep(grouped[prefix], result)
            }
        }
    }

    return grouped;
}

export {
    mergeHeaders,
    addQuarantineSegmentToUrl,
    groupByPrefixAndStructure,
    mapUrls
}