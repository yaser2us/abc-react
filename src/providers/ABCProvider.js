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

const ABCProvider = ({
  children,
  getModel,
  updateModel,
  model,
  analytic,
  debug = false,
  event: {
    eventType = "view_screen",
    eventName = "screen_name",
    eventValue = "abc-platform"
  } = {}
}) => {
  const {
    misc: {
      abcTesting: {
        iamABCTester = false,
        abcScope = 888888,
        abcEndpoint,
        // abcEnable,
        abcSdk,
        abcTimeout = 30000,
        abcDefaultAttributes = {}
      } = {}
    },
  } = getModel(["misc"]);

  const [isReady, setIsReady] = useState(false);

  const arrayChildren = Children.toArray(children);

  const gb = useMemo(
    () => {
      if (iamABCTester && model?.misc?.abcTesting?.abcEnable) {
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
          trackingCallback: (experiment, result) => {
            if (analytic && analytic instanceof Function) {
              try {
                console.log("[abc] abc-experiment-done", {
                  experimentId: experiment.key,
                  variationId: result.key,
                });
                analytic("abc-experiment-done", {
                  experimentId: experiment?.key,
                  variationId: result?.key,
                });
              } catch (error) {
                if (debug) {
                  console.log('[abc]', error);
                }
              }
            }
            
          },
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
    if (model?.misc?.abcTesting?.iamABCTester && model?.misc?.abcTesting?.abcEnable) {
      if (analytic && analytic instanceof Function) {
        try {
          analytic(eventType, {
            [eventName]: eventValue
          });
        } catch (error) {
          if (debug) {
            console.log('[abc]', error);
          }
        }
      }

      gb.loadFeatures({
        timeout: abcTimeout,
      }).then(() => {
        setIsReady(true);
      });
      gb.setAttributes({
        ...abcDefaultAttributes,
        ...(model?.user && model.user || {}),
        ...(model?.cohort && model?.cohort || {}),
        scope: abcScope
      });
    }
  }, [model?.misc?.abcTesting?.abcEnable, model?.misc?.abcTesting?.iamABCTester, model?.user, model?.cohort]);

  const evaluateFeatures = () => {
    if (iamABCTester && model?.misc?.abcTesting?.abcEnable) {

      try {
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
      } catch (error) {
        if (debug) {
          console.log('[abc]', error);
        }
      }
    }
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    evaluateFeatures();
  }, [isReady, model?.misc?.abcTesting?.iamABCTester]);

  return (
    <GrowthBookProvider growthbook={gb}>
      {Children.map(arrayChildren, (child) => {
        return cloneElement(child, {});
      })}
    </GrowthBookProvider>
  );
};

export default ABCProvider;