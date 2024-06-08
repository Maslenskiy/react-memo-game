import { Button } from "../Button/Button";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import styles from "./EndGameModal.module.css";
import { addLeaders } from "../../utils/api";
import { ModeContext } from "../../context/ModeContext";
import { useAchievements } from "../../context/AchievementContext";

export function EndGameModal({ isWon, gameDurationSeconds, gameDurationMinutes, onClick }) {
  const { achievements } = useAchievements();
  const { level } = useContext(ModeContext);
  const [username, setUsername] = useState("");
  const handleUsername = e => {
    setUsername(e.target.value);
  };

  const handleScore = () => {
    if (username.trim() === "") {
      alert("Введите имя");
      console.log("Пользователь не введён, используется имя 'Пользователь'");
      setUsername("Пользователь");
      return;
    }
    const totalTimeInSeconds = gameDurationMinutes * 60 + gameDurationSeconds;
    addLeaders({ name: username, time: totalTimeInSeconds, achievements: achievements })
      .then(() => {
        alert("Пользователь добавлен");
        onClick();
      })
      .catch(error => {
        console.warn(error);
        alert("Не удалось добавить пользователя");
      });
  };

  const title = isWon ? (level === "9" ? "Вы попали на лидерборд!" : "Вы победили!") : "Вы проиграли!";

  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;

  const imgAlt = isWon ? "celebration emodji" : "dead emodji";

  return (
    <div className={styles.modal}>
      <img className={styles.image} src={imgSrc} alt={imgAlt} />
      <div className={styles.title}>{title}</div>
      {isWon && level === "9" && (
        <input
          className={styles.input_user}
          type="text"
          value={username}
          onChange={handleUsername}
          placeholder="Пользователь"
        />
      )}
      {isWon && level === "9" && (
        <button className={styles.buttonmode_addscore} onClick={() => handleScore()}>
          Добавить пользователя
        </button>
      )}
      <p className={styles.description}>Затраченное время:</p>
      <div className={styles.time}>
        {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
      </div>

      <Button onClick={onClick}>Начать сначала</Button>
      <Link to="/">
        <Button>Вернуться к выбору сложности</Button>
      </Link>
      {isWon && level === "9" && (
        <Link className={styles.title_leaderboard} to="/leaderboard">
          Перейти к лидерборду
        </Link>
      )}
    </div>
  );
}
