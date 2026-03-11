# abc-react

> A/B testing platform for React, powered by [GrowthBook](https://www.growthbook.io/).

[![NPM](https://img.shields.io/npm/v/abc-react.svg)](https://www.npmjs.com/package/abc-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Overview

`abc-react` provides three main capabilities:

| Export | Purpose |
|---|---|
| `ABCProvider` | React context provider that initializes GrowthBook, evaluates feature flags, and groups results by prefix (`api`, `response`, `navigation`, `context`). |
| `requestInterceptor` | Rewrites outgoing request URLs (and optionally prepends a path prefix) based on A/B test results. |
| `responseInterceptor` | Merges alternative response data into Axios responses based on A/B test results. |

## Install

```bash
npm install --save abc-react
```

### Peer Dependencies

| Package | Supported versions |
|---|---|
| `react` | `^16.13.1 \|\| ^17.x \|\| ^18.2.0` |

### Bundled Dependencies

`@growthbook/growthbook-react@1.0.0`, `lodash@4.17.20`, `url-parse@1.5.10`

---

## Exports

```js
import { ABCProvider, requestInterceptor, responseInterceptor } from 'abc-react';
```

---

## ABCProvider

A React component that wraps your app with `GrowthBookProvider`. It:

1. Creates a `GrowthBook` instance using config from `model.misc.abcTesting`.
2. Sets user/cohort attributes on the instance.
3. Evaluates all feature flags once GrowthBook is ready.
4. Groups results by feature-key prefix (`api-*`, `response-*`, `navigation-*`, `context-*`) and passes the grouped data back via `updateModel`.
5. Fires analytics events on experiment assignment and screen view.

### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | `ReactNode` | Yes | — | Child components to render. |
| `getModel` | `(keys: string[]) => object` | Yes | — | Returns slices of the current app model. Must support `getModel(["misc"])` returning `{ misc: { abcTesting: { ... } } }`. |
| `updateModel` | `(data: object) => void` | Yes | — | Callback that receives grouped feature-flag results to merge into app state. |
| `model` | `object` | Yes | — | The current app model. The provider reacts to changes in `model.misc.abcTesting`, `model.user`, and `model.cohort`. |
| `analytic` | `(eventName: string, payload: object) => void` | No | — | Analytics callback. Called on screen view and each experiment assignment. |
| `debug` | `boolean` | No | `false` | Enables `console.log` output for errors and diagnostics. |
| `event` | `object` | No | see below | Customises the screen-view analytics event. |

#### `event` shape

| Field | Type | Default |
|---|---|---|
| `eventType` | `string` | `"view_screen"` |
| `eventName` | `string` | `"screen_name"` |
| `eventValue` | `string` | `"abc-platform"` |

#### `model.misc.abcTesting` shape

These fields are read from `getModel(["misc"]).misc.abcTesting`:

| Field | Type | Default | Description |
|---|---|---|---|
| `iamABCTester` | `boolean` | `false` | Master toggle — must be `true` to enable A/B testing. |
| `abcEnable` | `boolean` | — | Secondary toggle checked at runtime. |
| `abcEndpoint` | `string` | — | GrowthBook API host URL. |
| `abcSdk` | `string` | — | GrowthBook client key. |
| `abcScope` | `number` | `888888` | Scope attribute sent to GrowthBook. |
| `abcTimeout` | `number` | `30000` | Timeout (ms) for GrowthBook init. |
| `abcDefaultAttributes` | `object` | `{}` | Extra attributes merged into the GrowthBook attribute set. |

### Feature-Key Prefix Conventions

Features returned by GrowthBook are grouped by the prefix before the first `-`:

| Prefix | Behaviour |
|---|---|
| `api-*` | Maps `defaultValue → result` (URL replacement dictionary for `requestInterceptor`). |
| `response-*` | Spreads `result` into a `response` dictionary (for `responseInterceptor`). |
| `navigation-*` | Spreads `result` into a `navigation` dictionary. |
| `context-*` | Deep-merges `result` into the root of the grouped output. |

### Example

```jsx
import React from 'react';
import { ABCProvider } from 'abc-react';

const App = () => {
  const getModel = (keys) => ({
    misc: {
      abcTesting: {
        iamABCTester: true,
        abcEnable: true,
        abcEndpoint: 'https://growthbook.example.com',
        abcSdk: 'sdk-abc123',
      },
    },
  });

  const updateModel = (data) => {
    // data = { api: { ... }, response: { ... }, navigation: { ... }, ...context }
    console.log('Feature flags evaluated:', data);
  };

  const analytic = (event, payload) => {
    console.log('Analytics:', event, payload);
  };

  return (
    <ABCProvider
      getModel={getModel}
      updateModel={updateModel}
      model={{
        misc: { abcTesting: { iamABCTester: true, abcEnable: true } },
        user: { id: 'u1' },
        cohort: { segment: 'beta' },
      }}
      analytic={analytic}
      debug
    >
      <YourApp />
    </ABCProvider>
  );
};
```

---

## Interceptors

Designed for use with Axios interceptors, but work with any object that follows the same shape.

### `requestInterceptor({ getModel, request, debug? })`

Rewrites `request.url` using the `api` dictionary produced by `ABCProvider`.

| Param | Type | Description |
|---|---|---|
| `getModel` | `function` | Must return `{ api: { [originalUrl]: replacementUrl } }` when called with `["api"]`, and a `requests` config when called with `"requests"`. |
| `request` | `object` | Axios request config (must have a `url` property). |
| `debug` | `boolean` | Optional. Enables logging. |

**`requests` config** (returned by `getModel("requests")`):

| Field | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `false` | When `true`, prepends `prefix` to the URL path. |
| `prefix` | `string` | `""` | Path segment inserted after the domain (e.g. `"quarantine"`). |
| `headers` | `object` | `{}` | _(reserved, not currently merged)_ |

Returns the (possibly modified) `request`.

### `responseInterceptor({ getModel, response, debug? })`

Deep-merges alternative data into `response` using the `response` dictionary produced by `ABCProvider`.

| Param | Type | Description |
|---|---|---|
| `getModel` | `function` | Must return `{ response: { [url]: mergeData } }` when called with `["response"]`. |
| `response` | `object` | Axios response object. Must have `config.url`. |
| `debug` | `boolean` | Optional. Enables logging. |

Returns the (possibly modified) `response`.

### Axios Integration Example

```js
import axios from 'axios';
import { requestInterceptor, responseInterceptor } from 'abc-react';

const api = axios.create();

api.interceptors.request.use((request) =>
  requestInterceptor({ getModel, request, debug: false })
);

api.interceptors.response.use((response) =>
  responseInterceptor({ getModel, response, debug: false })
);
```

---

## Utility Functions (internal)

Exported from `src/tools` — not part of the public API but available internally:

| Function | Description |
|---|---|
| `mapUrls(url, urlMappings)` | Returns `urlMappings[url]` if it exists, otherwise the original `url`. |
| `addQuarantineSegmentToUrl(url, segment)` | Inserts a path segment after the domain (e.g. `/segment/original/path`). |
| `mergeHeaders(original, newHeaders)` | Deep-merges two header objects via `lodash/merge`. |
| `groupByPrefixAndStructure(data)` | Groups evaluated feature flags by their key prefix (`api`, `response`, `navigation`, `context`). |

---

## Development

```bash
# Build the library (outputs to dist/)
npm run build

# Watch mode during development
npm start

# Run the example app
cd example && npm start
# — or from root —
npm run love

# Run tests
npm test

# Deploy example to GitHub Pages
npm run deploy
```

### Project Structure

```
src/
├── index.js                  # Public entry — exports ABCProvider, requestInterceptor, responseInterceptor
├── providers/
│   └── ABCProvider.js        # GrowthBook wrapper component
├── interceptors/
│   └── Interceptors.js       # Request & response interceptor functions
└── tools/
    └── Tools.js              # URL mapping, header merging, feature grouping utilities
example/
└── src/App.js                # Minimal usage example
```

## License

MIT © [yaser2us](https://github.com/yaser2us)
  );
};

export default App;
```

## Summary

The `ABCProvider` component provides a convenient way to integrate A/B testing and feature flagging into your React application using GrowthBook. By properly configuring the provider, you can track user interactions, evaluate features, and ensure that your application is optimized for different user experiences.

--- 
