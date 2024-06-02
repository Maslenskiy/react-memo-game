import { useContext } from "react";
import { CountContext } from "../../contexts/count";

export const useCount = () => {
  return useContext(CountContext);
};
