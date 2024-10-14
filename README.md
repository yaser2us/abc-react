# abc-react

> It is abc testing platform.

[![NPM](https://img.shields.io/npm/v/abc-react.svg)](https://www.npmjs.com/package/abc-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save abc-react
```

Here's a documentation draft for the `ABCProvider` component, explaining its purpose, props, internal logic, and usage.

---

# ABCProvider Component

The `ABCProvider` component is a React wrapper that integrates with GrowthBook, allowing for A/B testing and feature flagging. It manages the initialization of the GrowthBook instance and evaluates features based on the user's model and attributes. This component provides an easy way to set up A/B testing in a React application while ensuring that analytic events are tracked and features are evaluated accordingly.

## Props

### Required Props

- **children**: ReactNode  
  The child components that will be wrapped by the `ABCProvider`.

### Optional Props

- **getModel**: Function  
  A function that retrieves the model data used for determining A/B testing settings and user attributes.

- **updateModel**: Function  
  A function that updates the model data, typically with the results of the A/B tests.

- **model**: Object  
  An object representing the current model, which includes user information, cohort data, and A/B testing settings.

- **analytic**: Function  
  A callback function for tracking analytic events related to A/B testing. If provided, it will be invoked on experiment completion and screen views.

- **debug**: Boolean  
  A flag that, when set to `true`, enables additional console logging for debugging purposes. Defaults to `false`.

- **event**: Object  
  An object for customizing analytic event parameters, with the following optional fields:
  - **eventType**: String (default: `"view_screen"`)  
    The type of event to log (e.g., "view_screen").
  - **eventName**: String (default: `"screen_name"`)  
    The name of the event (e.g., "screen_name").
  - **eventValue**: String (default: `"abc-platform"`)  
    The value associated with the event.

## Internal Logic

1. **Initialization**: 
   - The component initializes a GrowthBook instance based on the user's A/B testing settings. This includes setting the API host and client key.
   - It sets up a tracking callback to log experiment completions and send analytic events if an `analytic` function is provided.

2. **Effect Hooks**:
   - The component uses `useEffect` to initialize GrowthBook when the component mounts and when the model changes.
   - It tracks when the GrowthBook instance is ready by updating the `isReady` state.

3. **Feature Evaluation**:
   - The component evaluates all available features using the GrowthBook instance and updates the model with the results grouped by prefix.

4. **Error Handling**:
   - Error handling is implemented throughout to catch and log errors to the console if debugging is enabled.

## Usage

To use the `ABCProvider`, wrap your components within it and provide the necessary props. Below is an example of how to integrate `ABCProvider` in a React application:

```jsx
import React from 'react';
import ABCProvider from './path/to/ABCProvider';

const App = () => {
  const getModel = () => {
    // Logic to retrieve the model
  };

  const updateModel = (data) => {
    // Logic to update the model
  };

  const analytic = (event, data) => {
    // Logic for tracking analytics
  };

  return (
    <ABCProvider
      getModel={getModel}
      updateModel={updateModel}
      model={{ /* model data */ }}
      analytic={analytic}
      debug={true}
    >
      {/* Child components go here */}
    </ABCProvider>
  );
};

export default App;
```

## Summary

The `ABCProvider` component provides a convenient way to integrate A/B testing and feature flagging into your React application using GrowthBook. By properly configuring the provider, you can track user interactions, evaluate features, and ensure that your application is optimized for different user experiences.

--- 
