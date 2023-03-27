const WaitSM = ({ conds, events }) => {
  const onObject = {};
  const conditionFn = () => {
    const flag = !conds.some((fn) => !fn());
    console.log("condition Fn, check", flag);
    return flag;
  };
  events.forEach((eventName) => {
    onObject[eventName] = {
      target: "initial",
    };
  });
  return {
    initial: "initial",
    states: {
      initial: {
        always: [{ target: "finalState", cond: conditionFn }],
        on: onObject,
      },
      finalState: { type: "final" },
    },
  };
};

export default WaitSM;
