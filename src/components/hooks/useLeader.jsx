import { useContext } from "react";
import { LeaderContext } from "../../contexts/leaders";

export const useLeader = () => {
  return useContext(LeaderContext);
};
