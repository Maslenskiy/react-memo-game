import styles from "./EndGameModal.module.css";
import { Button } from "../Button/Button";
import { useLeader } from "../hooks/useLeader";
import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { Link } from "react-router-dom";
export function EndGameModal({ isWon, gameDurationSeconds, gameDurationMinutes, onClick, isLeader, timeFunc }) {
  const title = isLeader ? "Вы попали на Лидерборд!" : isWon ? "Вы победили!" : "Вы проиграли!";
  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;

  const imgAlt = isWon ? "celebration emodji" : "dead emodji";
  const { getUser } = useLeader();
  function handleInputChange(e) {
    const { value } = e.target;
    getUser(value);
  }

  function click() {
    timeFunc();
    onClick();
  }
  return (
    <div className={styles.modal}>
      <img className={styles.image} src={imgSrc} alt={imgAlt} />
      <h2 className={styles.title}>{title}</h2>
      {isLeader ? (
        <input placeholder="Пользователь" onChange={handleInputChange} className={styles.inputName}></input>
      ) : (
        ""
      )}
      <p className={styles.description}>Затраченное время:</p>
      <div className={styles.time}>
        {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
      </div>

      <Button onClick={click}>Начать сначала</Button>
      <Link to="/leaderboard" className={styles.linkLeader} onClick={() => timeFunc()}>
        Перейти к лидерборду
      </Link>
    </div>
  );
}
