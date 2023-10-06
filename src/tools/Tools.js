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
    console.log("[addQuarantineSegmentToUrl]", url);
    // Get the modified URL
    const modifiedUrl = url.toString();

    return modifiedUrl;
}

function mergeHeaders(originalHeaders = {}, newHeaders = {}) {
    // Get the modified headers
    const modifiedHeaders = merge(originalHeaders, newHeaders);
    console.log(modifiedHeaders, "[mergeHeaders]");

    return modifiedHeaders;
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
                grouped[prefix][defaultValue] = result; // Use "defaultValue" as key and "result" as value for "api" prefix
            } else if (prefix === "response") {
                // const defaultValue = valueObject.defaultValue.url;
                const result = valueObject.result;
                // grouped[prefix][defaultValue] = result;

                grouped[prefix] = {
                    ...grouped[prefix],
                    ...result,
                };
            } else if (prefix === "context") {
                const keyWithoutPrefix = parts.slice(1).join("-"); // Remove the prefix
                const result = valueObject.result;
                console.log(keyWithoutPrefix, result, "contexttttttt");

                //   grouped[prefix][keyWithoutPrefix] = result; // Remove prefix and use "result" as value for other prefixes
                grouped = {
                    ...grouped,
                    ...result,
                };
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

export {
    mergeHeaders,
    addQuarantineSegmentToUrl,
    groupByPrefixAndStructure,
    mapUrls
}