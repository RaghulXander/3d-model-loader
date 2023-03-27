import React, { useEffect } from "react";

import Root from "./pages/Root";
import { APP_SM, APP_SM_CONST } from "./machines/AppSM";

import { CoreModules } from "./modules";
import { StateStores } from "./state";

import instantiateStateMachine from "./utils/instantiateStateMachine";

function App() {
  useEffect(() => {
    // instantiate SM

    const configSM = APP_SM({
      ...CoreModules,
      ...StateStores,
    });
    instantiateStateMachine(configSM, APP_SM_CONST.ID);
  }, []);
  return <Root />;
}

export default App;
