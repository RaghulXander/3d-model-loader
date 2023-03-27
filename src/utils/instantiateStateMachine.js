import { createMachine, interpret } from "xstate";
import Event from "../modules/Event";

const instantiateStateMachine = (smConfig, appId) => {
  // console.log("State Machine config", JSON.stringify(smConfig, null, 2));
  const machine = createMachine(smConfig);
  if (machine != null) {
    const service = interpret(machine);
    service.subscribe((state) =>
      console.info("StateMachine service subs", state.value, state.event)
    );
    const sendSMEvent = (event, metadata) => {
      console.info("StateMachine send event", event, metadata);
      service.send({ type: event, metadata });
    };
    Event.subscribe(appId, sendSMEvent);
    service.start();
  }
};

export default instantiateStateMachine;
