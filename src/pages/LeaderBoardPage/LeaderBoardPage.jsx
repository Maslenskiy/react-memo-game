import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import styles from "../LeaderBoardPage/LeaderboardPage.module.css";
import { getLeaders } from "../../utils/api";

export function LeaderboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getLeaders()
      .then(data => {
        const sortedLeaders = [...data];
        sortedLeaders.sort((a, b) => a.time - b.time);
        console.log(sortedLeaders);
        setLeaders(sortedLeaders);
      })
      .catch(error => {
        console.warn(error);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.text}>Лидерборд</h1>
        <Link to="/">
          <Button>Начать игру</Button>
        </Link>
      </div>
      {isLoaded ? (
        <>
          <div className={styles.thead}>
            <div className={styles.leaderboard_unit}>
              <div className={styles.leaderboard_ttl}>Позиция</div>
              <div className={styles.leaderboard_ttl}>Пользователь</div>
              <div className={styles.leaderboard_ttl}>Достижения</div>
              <div className={styles.leaderboard_ttl}>Время</div>
            </div>
          </div>
          {leaders.map((leader, index) => (
            <div key={leader.id} className={styles.leaderboard_unit}>
              <div className={styles.leaderboard_text}>#{index + 1}</div>
              <div className={styles.leaderboard_text}>{leader.name}</div>
              <div className={styles.leaderboard_achievements}>
                {leader.achievements && leader.achievements.includes(1) ? (
                  <div className={styles.leaderboard_achievements_item} title="Игра пройдена в сложном режимe">
                    <button className={styles.puzzle}></button>
                  </div>
                ) : (
                  <button className={styles.puzzleGray}></button>
                )}
                {leader.achievements && leader.achievements.includes(2) ? (
                  <div className={styles.leaderboard_achievements_item} title="Игра пройдена без супер-сил">
                    <button className={styles.vision}></button>
                  </div>
                ) : (
                  <button className={styles.visionGray}></button>
                )}
              </div>
              <div className={styles.time}>
                {Math.floor(leader.time / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(leader.time % 60).toString().padStart(2, "0")}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div>
          <p className={styles.leaderboard_ttl}>Загрузка страницы...</p>
        </div>
      )}
    </div>
  );
}
