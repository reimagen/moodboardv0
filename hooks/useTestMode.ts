import { useState } from "react";

export const useTestMode = () => {
  const [useTestFlows, setUseTestFlows] = useState(true);
  return { useTestFlows, setUseTestFlows };
};
