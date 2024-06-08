import React, { createContext, useContext, useState } from "react";

const AchievementsContext = createContext();
export const useAchievements = () => useContext(AchievementsContext);

export const AchievementsProvider = ({ children }) => {
  const [achievements, setAchievements] = useState([]);

  const addAchievement = achievementId => {
    setAchievements(prevList => [...prevList, achievementId]);
  };

  const resetAchievements = () => {
    setAchievements([]);
  };

  return (
    <AchievementsContext.Provider value={{ achievements, addAchievement, resetAchievements }}>
      {children}
    </AchievementsContext.Provider>
  );
};
