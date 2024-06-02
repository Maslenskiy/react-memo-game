import { shuffle } from "lodash";
import { useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { useCount } from "../hooks/useCount";
import { useLeader } from "../hooks/useLeader";
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

  const diffInSecconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSecconds / 60);
  const seconds = diffInSecconds % 60;
  const col = minutes * 60 + seconds;
  return {
    minutes,
    seconds,
    col,
  };
}
/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 */
export function Cards({ pairsCount = 3, previewSeconds = 5, lostCount, getLost }) {
  // console.log(count, getCount);
  const { user } = useLeader();
  // const [boards, setBoard] = useState(null);
  // В cards лежит игровое поле - массив карт и их состояние открыта\закрыта
  const [cards, setCards] = useState([]);
  const [prevCard, setPrevCard] = useState(null);
  const [count, setCount] = useState(false);
  // Текущий статус игры
  const { lite } = useCount();
  const [status, setStatus] = useState(STATUS_PREVIEW);
  const [isLeader, setIsLeader] = useState(false);
  const { leaderBoard } = useLeader();
  // Дата начала игры
  const [gameStartDate, setGameStartDate] = useState(null);
  // Дата конца игры
  const [gameEndDate, setGameEndDate] = useState(null);
  // const [isPaused, setIsPaused] = useState(false);
  // const [isUsed, setIsUsed] = useState(false);

  // Стейт для таймера, высчитывается в setInteval на основе gameStartDate и gameEndDate
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
    col: 0,
  });

  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);
    setCount(false);
    getLost(0);
  }
  function startGame() {
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
  }
  function resetGame() {
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
  }
  /*
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может пепереходит в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */

  // function showCards() {
  //   if (!isUsed) {
  //     setIsUsed(true);
  //     setIsPaused(true);
  //     const prevCards = cards;
  //     setCards(cards.map(card => ({ ...card, open: true })));
  //     setTimeout(() => {
  //       setCards(prevCards);
  //       setIsPaused(false);
  //     }, 5000);
  //   }
  // }
  const openCard = clickedCard => {
    setCount(!count);
    if (lite) {
      if (count) {
        if (prevCard?.suit !== clickedCard.suit || prevCard?.rank !== clickedCard.rank) {
          getLost(++lostCount);
        }
      }
      if (lostCount === 3) {
        finishGame(STATUS_LOST);
      }
    }
    setPrevCard(clickedCard);
    // Если карта уже открыта, то ничего не делаем
    if (clickedCard.open) {
      return;
    }
    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id !== clickedCard.id) {
        return card;
      }

      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);

    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      if (lite) {
        if (lostCount < 3) {
          finishGame(STATUS_WON);
          if (cards.length) {
            console.log(leaderBoard);
            const sortedData = [...leaderBoard, timer].sort((a, b) => a.time - b.time);
            console.log(sortedData);
            let index = sortedData.indexOf(timer);
            if (index <= 9) {
              setIsLeader(true);
            } else {
              setIsLeader(false);
            }
          }
          return;
        }
      } else {
        finishGame(STATUS_WON);
        return;
      }
    }

    // Открытые карты на игровом поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);

      if (sameCards.length < 2) {
        return true;
      }

      return false;
    });
    // setCards(cards.map(card => (openCardsWithoutPair.includes(card) ? { ...card, open: false } : card)));

    const playerLost = openCardsWithoutPair.length >= 2;

    // "Игрок проиграл", т.к на поле есть две открытые карты без пары
    if (playerLost) {
      if (!lite) {
        finishGame(STATUS_LOST);
        return;
      }
    }

    // ... игра продолжается
  };

  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
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
    // if (isPaused) {
    //   console.log("yes");
    //   return;
    // }
    const intervalId = setInterval(() => {
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate]);
  const time = async () => {
    let response = await fetch(" https://wedev-api.sky.pro/api/leaderboard", {
      method: "POST",
      body: JSON.stringify({
        name: user,
        time: timer.col,
      }),
    });
    let result = await response.json();
    console.log(result);
    // let time = timer;
    // time["user"] = user;
    // const sortedData = [...leaderBoard, timer].sort((a, b) => a.col - b.col);
    // console.log(sortedData);
    // let index = sortedData.indexOf(timer);
    // getLeaders(sortedData.slice(0, 9));
    // if (index <= 9) {
    //   setIsLeader(true);
    // } else {
    //   setIsLeader(false);
    // }
  };
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
        {status === STATUS_IN_PROGRESS ? <Button onClick={resetGame}>Начать заново</Button> : null}
      </div>
      {/* <p className={styles.show} onClick={showCards}>
        Прозрение
      </p> */}
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
      {lite ? <p className={styles.count}>Осталось {3 - lostCount} попыток</p> : ""}

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
            isLeader={isLeader}
            timeFunc={time}
          />
        </div>
      ) : null}
    </div>
  );
}
