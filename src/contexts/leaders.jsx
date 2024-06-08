import { createContext, useState } from "react";
import { useEffect } from "react";
export const LeaderContext = createContext();

export const LeaderProvider = ({ children }) => {
  const [leaderBoard, setleaderBoard] = useState([]);
  const [user, setUser] = useState("");

  const getLeaders = leaders => {
    setleaderBoard(leaders);
  };

  const getUser = user => {
    setUser(user);
  };
  useEffect(() => {
    fetch("https://wedev-api.sky.pro/api/v2/leaderboard")
      .then(response => response.json())
      .then(data => setleaderBoard(data.leaders));
  }, []);
  return <LeaderContext.Provider value={{ getLeaders, leaderBoard, user, getUser }}>{children}</LeaderContext.Provider>;
};
