import React, {
  useEffect,
  useState,
  useMemo,
  Children,
  cloneElement
} from "react";

import {
  GrowthBook,
  GrowthBookProvider,
} from "@growthbook/growthbook-react";

import {
  groupByPrefixAndStructure
} from "../tools"

const ABCProvider = ({ children, getModel, updateModel, model, analytic, debug = false }) => {
  const {
    misc: {
      iamABCTester,
      abcScope,
      abcEndpoint,
      abcEnable,
      abcSdk,
      abcTimeout = 30000,
      abcDefaultAttributes = {}
    },
  } = getModel(["misc"]);

  // console.log(iamABCTester, abcScope, abcSdk, "[ABCProvider] iamABCTester", abcEnable);

  const [isReady, setIsReady] = useState(false);

  const arrayChildren = Children.toArray(children);

  const gb = useMemo(
    () => {
      if (iamABCTester) {
        // console.log(iamABCTester, "iamABCTesteriamABCTester useMemo");
        const gb = new GrowthBook({
          apiHost: abcEndpoint,
          clientKey: abcSdk,
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
        return gb;
      }
    },
    [abcEndpoint, iamABCTester]
  );

  useEffect(() => {
    if (iamABCTester && model.misc.abcEnable) {
      if (analytic && analytic instanceof Function) {
        try {
          logEvent("view_screen", {
            "screen_name": "abc-platform"
          });
        } catch (error) {
          if(debug){
            console.log(error);
          }
        }
      }
      gb.loadFeatures({
        timeout: abcTimeout,
      }).then(() => {
        setIsReady(true);
      });
    }
  }, [model.misc.abcEnable, model.misc.iamABCTester]);

  const evaluateFeatures = () => {
    if (iamABCTester && model.misc.abcEnable) {
      const allFeatures = gb.getFeatures();

      let done = {};
      Object.keys(allFeatures).map((key) => {
        const result = gb.getFeatureValue(key, allFeatures[key].defaultValue);
        done[key] = {
          defaultValue: allFeatures[key].defaultValue,
          result,
        };
      });

      // Call the function to group by prefix
      const groupedData = groupByPrefixAndStructure(done);

      updateModel({ ...groupedData });
    }
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    gb.setAttributes({
      ...abcDefaultAttributes,
      scope: abcScope
    });

    evaluateFeatures();
  }, [isReady, model.misc.iamABCTester]);

  return (
    <GrowthBookProvider growthbook={gb}>
      {Children.map(arrayChildren, (child) => {
        return cloneElement(child, {});
      })}
    </GrowthBookProvider>
  );
};

export default ABCProvider;