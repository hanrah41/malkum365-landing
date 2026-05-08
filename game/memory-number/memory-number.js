document.addEventListener("DOMContentLoaded", () => {

  let currentNumber = "";

  const numberDisplay =
    document.getElementById("numberDisplay");

  const answerInput =
    document.getElementById("answerInput");

  const startGameBtn =
    document.getElementById("startGameBtn");

  const checkAnswerBtn =
    document.getElementById("checkAnswerBtn");

  const restartGameBtn =
    document.getElementById("restartGameBtn");

  const gameResult =
    document.getElementById("gameResult");

  // 숫자 생성
  function createRandomNumber() {

    return String(
      Math.floor(10000 + Math.random() * 90000)
    );
  }

  // 초기화
  function initGame() {

    numberDisplay.innerHTML =
      "• &nbsp; • &nbsp; • &nbsp; • &nbsp; •";

    answerInput.style.display = "none";

    answerInput.value = "";

    gameResult.textContent = "";

    startGameBtn.style.display = "block";

    checkAnswerBtn.style.display = "none";

    restartGameBtn.style.display = "none";
  }

  // 게임 시작
  function startGame() {

    currentNumber = createRandomNumber();

    // 숫자 표시
    numberDisplay.textContent = currentNumber;

    // 입력창 숨김
    answerInput.style.display = "none";

    answerInput.value = "";

    // 결과 초기화
    gameResult.textContent = "";

    // 버튼 처리
    startGameBtn.style.display = "none";

    checkAnswerBtn.style.display = "none";

    restartGameBtn.style.display = "none";

    // 3초 후
    setTimeout(() => {

      // 숫자 숨김
      numberDisplay.innerHTML =
        "• &nbsp; • &nbsp; • &nbsp; • &nbsp; •";

      // 입력창 표시
      answerInput.style.display = "block";

      // 확인 버튼 표시
      checkAnswerBtn.style.display = "block";

      answerInput.focus();

    }, 3000);
  }

  // 확인
  function checkAnswer() {

    const userAnswer =
      answerInput.value.trim();

    if (!userAnswer) {

      alert("숫자를 입력해 주세요.");

      return;
    }

    let correctCount = 0;

    for (let i = 0; i < 5; i++) {

      if (userAnswer[i] === currentNumber[i]) {

        correctCount++;
      }
    }

    if (userAnswer === currentNumber) {

      gameResult.textContent =
        "정답입니다. 기억력이 매우 좋으십니다.";

    } else {

      gameResult.textContent =
        "5개 중 " +
        correctCount +
        "개 기억하셨습니다.";
    }

    checkAnswerBtn.style.display = "none";

    restartGameBtn.style.display = "block";
  }

  // 다시 테스트
  function restartGame() {

    // 즉시 새 게임 시작
    startGame();
  }

  // 이벤트
  startGameBtn.addEventListener(
    "click",
    startGame
  );

  checkAnswerBtn.addEventListener(
    "click",
    checkAnswer
  );

  restartGameBtn.addEventListener(
    "click",
    restartGame
  );

  // 초기 실행
  initGame();

});