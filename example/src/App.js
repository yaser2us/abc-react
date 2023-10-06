import React from 'react'

import ABCProvider from 'abc-react'
import 'abc-react/dist/index.css'

const App = () => {

  let context = {}

  return <ABCProvider
    getModel={(data) => {
      return {
        misc: {
          iamABCTester: true
        }
      }
    }}
    model={{
      misc: {
        iamABCTester: true
      }
    }}
    updateModel={(data) => {
      context = { ...context, ...data }
      console.log(context, 'yesssssssss')
      return {
        misc: {
          iamABCTester: true
        }
      }
    }}
  >
    <p>hihiihihhi</p>
  </ABCProvider>
}

export default App
