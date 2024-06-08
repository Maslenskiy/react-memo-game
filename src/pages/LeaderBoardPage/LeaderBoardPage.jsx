import styles from "./board.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
export function LeaderBoard() {
  const [boards, setBoard] = useState(null);
  const [resBoard, setResBoard] = useState(null);
  async function getLeadersFromServe() {
    let response = await fetch("https://wedev-api.sky.pro/api/leaderboard");
    if (response.ok) {
      await response.json().then(response => setBoard(response.leaders));
    }
  }
  useEffect(() => {
    getLeadersFromServe();
  }, []);

  useEffect(() => {
    setResBoard(boards?.map(board => ({ ...board, minutes: Math.floor(board.time / 60), seconds: board.time % 60 })));
  }, [boards]);
  return (
    <div className={styles.main}>
      <div className={styles.wrapperHeader}>
        <p className={styles.titleLeaderbord}>Лидерборд</p>
        <button className={styles.startBtn}>
          <Link to={"/"} className={styles.startLink}>
            Начать игру
          </Link>
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <div>Позиция</div>
            <div>Пользователь</div>
            <div>Время</div>
          </tr>
        </thead>
        <tbody>
          {resBoard?.map((time, index) => (
            <tr key={index} className={styles.trBody}>
              <td># {index + 1}</td>
              <td>{time.name}</td>
              <td>
                {time.minutes}:{time.seconds > 9 ? time.seconds : "0" + time.seconds}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
