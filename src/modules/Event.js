const setupEvent = () => {
  const subscribers = {};
  const send = (event, metadata) => {
    //
    Object.values(subscribers).forEach((fxn) => {
      if (fxn != null) fxn(event, metadata);
    });
  };
  return {
    sendSMEvent: (event, metadata) => {
      send(event, metadata);
    },
    subscribe: (name, fxn) => {
      subscribers[name] = fxn;
    },
    unsubscribe: (name) => {
      delete subscribers[name];
    },
  };
};

const Event = setupEvent();
export default Event;
