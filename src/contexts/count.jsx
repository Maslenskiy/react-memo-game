import { createContext, useState } from "react";
export const CountContext = createContext(0);

export const CountProvider = ({ children }) => {
  const [lostCount, setLostCount] = useState(0);
  const [lite, setLite] = useState(true);
  const getLost = cards => {
    setLostCount(cards);
  };

  const getLite = cards => {
    setLite(cards);
  };
  return <CountContext.Provider value={{ lostCount, getLost, lite, getLite }}>{children}</CountContext.Provider>;
};
