import { shuffle } from "lodash";
import { generateDeck } from "../../utils/cards";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { useContext, useEffect, useState } from "react";
import { ModeContext } from "../../context/ModeContext";
import styles from "./Cards.module.css";
import { useAchievements } from "../../context/AchievementContext";

// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";

function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }

  const diffInSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  return {
    minutes,
    seconds,
  };
}

/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 */

export function Cards({ pairsCount = 3, previewSeconds = 5 }) {
  const { isEnabled } = useContext(ModeContext);
  const { addAchievement, resetAchievements } = useAchievements();
  // const { addAchievement, resetAchievements } = useContext(AchievementsContex);
  const [cards, setCards] = useState([]);

  const [status, setStatus] = useState(STATUS_PREVIEW);

  const [gameStartDate, setGameStartDate] = useState(null);
  const [gameEndDate, setGameEndDate] = useState(null);

  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });

  const maxAttempts = isEnabled ? 3 : 1;
  const [attempts, setAttempts] = useState(maxAttempts);
  const [isVision, setIsVision] = useState(false);
  const [isVisionActive, seIisVisionActive] = useState(false);
  const [isTimerStop, setIsTimerStop] = useState(false);
  const [isAlohomora, setIsAlohomora] = useState(false);

  const vision = () => {
    setIsTimerStop(true);
    if (isVision) {
      return;
    }

    seIisVisionActive(true);
    setCards(prevCards => {
      return prevCards.map(card => {
        return {
          ...card,
          open: true,
        };
      });
    });
    setTimeout(() => {
      setCards(prevCards => {
        return prevCards.map(card => {
          if (card.guessed) {
            return {
              ...card,
              open: true,
            };
          }
          return {
            ...card,
            open: false,
          };
        });
      });
      seIisVisionActive(false);
      setIsVision(true);
      setIsTimerStop(false);
      let newDate = new Date(gameStartDate);
      newDate.setSeconds(newDate.getSeconds() + 5);
      setGameStartDate(newDate);
    }, 5000);
  };

  const alohomora = () => {
    if (isVisionActive) {
      return;
    }

    const closedCards = cards.filter(card => !card.open && !card.guessed);

    if (closedCards.length < 2) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * closedCards.length);
    const firstCard = closedCards[randomIndex];

    const secondCard = closedCards.find(
      card => card.id !== firstCard.id && card.rank === firstCard.rank && card.suit === firstCard.suit,
    );

    if (secondCard) {
      const nextCards = cards.map(card => {
        if (card.id === firstCard.id || card.id === secondCard.id) {
          return {
            ...card,
            open: true,
            guessed: true,
          };
        }
        return card;
      });

      setCards(nextCards);
      setIsAlohomora(true);
    }
  };

  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);

    if (status === STATUS_WON) {
      if (!isAlohomora && !isVision) {
        addAchievement(1);
      }
      if (!isEnabled) {
        addAchievement(2);
      }
    }
  }

  function startGame() {
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
    resetAchievements();
    setIsVision(false);
    setIsAlohomora(false);
  }

  function resetGame() {
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
    setAttempts(isEnabled ? 3 : 1);
    resetAchievements();
    setIsVision(false);
    setIsAlohomora(false);
  }

  const handleAttempts = () => {
    const updatedAttempts = attempts - 1;
    setAttempts(updatedAttempts);
    if (updatedAttempts <= 0) {
      finishGame(STATUS_LOST);
    }
  };

  const openCard = clickedCard => {
    if (clickedCard.open || status !== STATUS_IN_PROGRESS) {
      return;
    }

    const openCards = cards.filter(card => card.open && !card.guessed);

    if (openCards.length >= 2) {
      return;
    }

    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id === clickedCard.id || card.guessed) {
        return {
          ...card,
          open: true,
        };
      }
      return card;
    });
    setCards(nextCards);

    const openPairs = nextCards.filter(card => card.open && !card.guessed);
    const guessedPairs = openPairs.filter(card =>
      openPairs.some(openCard => card.id !== openCard.id && card.suit === openCard.suit && card.rank === openCard.rank),
    );

    if (guessedPairs.length === 2) {
      const updatedCards = nextCards.map(card => {
        if (guessedPairs.some(guessedCard => card.id === guessedCard.id)) {
          return {
            ...card,
            guessed: true,
          };
        }
        return card;
      });
      setCards(updatedCards);
      const isPlayerWon = updatedCards.every(card => card.guessed);
      if (isPlayerWon) {
        finishGame(STATUS_WON);
      }
    } else if (openPairs.length === 2) {
      handleAttempts();
      setTimeout(() => {
        const resetCards = nextCards.map(card => {
          if (!card.guessed) {
            return {
              ...card,
              open: false,
            };
          }
          return card;
        });
        setCards(resetCards);
      }, 1000);
    }
  };

  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isTimerStop) {
        return;
      }
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate, isTimerStop]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart("2", "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart("2", "0")}</div>
              </div>
            </>
          )}
        </div>
        {status === STATUS_IN_PROGRESS ? (
          <>
            <div className={styles.bar}>
              <button
                className={styles.vision}
                title="Прозрение"
                hint="На 5 секунд показываются все карты. Таймер длительности игры на это время останавливается."
                onClick={vision}
                disabled={isVision}
              />
              <button
                className={styles.alohomora}
                title="Алохомора"
                hint="Открывается случайная пара карт."
                onClick={alohomora}
                disabled={isAlohomora || isVisionActive}
              />
            </div>
            <Button onClick={resetGame}>Начать заново</Button>
          </>
        ) : null}
      </div>

      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
      </div>

      <div className={styles.footer_box}>
        <div className={styles.bar_element}>
          {isEnabled ? <p className={styles.attempts_txt}>Попытки: </p> : ""}
          {isEnabled ? (
            <p className={styles.attempts_counter}>
              {attempts} / {maxAttempts}
            </p>
          ) : (
            ""
          )}
        </div>
      </div>

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
          />
        </div>
      ) : null}
    </div>
  );
}
