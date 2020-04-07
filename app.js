const fieldContainer = document.querySelector('.field');
const gameForm = document.querySelector('.game_form');
const playBtn = document.querySelector('.js-play-btn');
const blocks = fieldContainer.children;
let makeBlueId;
let makeRedId;

gameForm.addEventListener('submit', handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();
  const mode = e.currentTarget.elements.mode.value;
  const name = e.currentTarget.elements.name.value;
  if (mode === '') {
    return gameField.showAlert('Please choose the game mode!');
  } else if (name === '') {
    return gameField.showAlert('Please enter your user name!');
  }

  await gameField.setDefaultValues(mode, name);
  const boundMakeBlockGreen = gameField.makeBlockGreen.bind(gameField);
  fieldContainer.addEventListener('click', boundMakeBlockGreen);

  if (makeBlueId !== undefined && makeRedId !== undefined) {
    clearInterval(makeBlueId);
    clearInterval(makeRedId);
  }

  makeBlueId = setInterval(
    () => gameField.makeRandomBlockBlue(makeBlueId),
    gameField.delay
  );
  makeRedId = setInterval(
    () => gameField.makeBlockRed(makeRedId),
    gameField.delay
  );
}

const gameField = {
  mode: null,
  fieldBlocksNum: 0,
  delay: 0,
  gameOver: false,
  user: {
    name: '',
    points: 0,
    isWinner: false,
  },
  pc: {
    name: 'Computer',
    points: 0,
    isWinner: false,
  },

  getGameSettings: async function () {
    try {
      const response = await axios.get(
        'https://starnavi-frontend-test-task.herokuapp.com/game-settings'
      );
      for (let key in response.data) {
        if (key === this.mode) {
          const modeNum = response.data[key].field;
          this.fieldBlocksNum = modeNum * modeNum;
          this.delay = response.data[key].delay;

          if (modeNum === 5) {
            fieldContainer.style.width = '250px';
          } else if (modeNum === 10) {
            fieldContainer.style.width = '500px';
          } else {
            fieldContainer.style.width = '750px';
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  },

  createGameField: function (amount) {
    for (let i = 0; i < amount; i += 1) {
      const block = document.createElement('div');
      block.classList.add('field_block');
      fieldContainer.append(block);
    }
  },

  makeRandomBlockBlue: function (intervalId) {
    const randomNum = Math.round(Math.random() * (blocks.length - 1));
    if (!blocks[randomNum].style.backgroundColor) {
      blocks[randomNum].style.backgroundColor = 'rgb(0, 102, 255)';
    } else {
      this.isGameOver(blocks, intervalId);
      if (this.gameOver === false) {
        this.makeRandomBlockBlue(intervalId);
      } else {
        this.checkWinner();
      }
    }
  },

  makeBlockRed: function (intervalId) {
    const blocksArr = Array.from(blocks);
    blocksArr.forEach((el) => {
      if (!el.style.backgroundColor) return;
      if (el.style.backgroundColor === 'rgb(0, 204, 0)') return;
      setTimeout(() => {
        if (el.style.backgroundColor === 'rgb(0, 102, 255)') {
          el.style.backgroundColor = 'rgb(255, 26, 26)';
          this.pc.points += 1;
          this.isGameOver(blocks, intervalId);
        }
      }, this.delay);
    });
  },

  makeBlockGreen: function (e) {
    if (!e.target.style.backgroundColor) return;
    if (e.target.style.backgroundColor === 'rgb(0, 102, 255)') {
      e.target.style.backgroundColor = 'rgb(0, 204, 0)';
      this.user.points += 1;
    }
  },

  isGameOver: function (nodes, intervalId) {
    const arr = Array.from(nodes);
    arr.every((el) => el.style.backgroundColor !== '')
      ? (this.gameOver = true)
      : (this.gameOver = false);
    if (this.gameOver === true) {
      clearInterval(intervalId);
    }
  },

  checkWinner: function () {
    const fiftyPercent = this.fieldBlocksNum * 0.5;
    if (this.user.points > fiftyPercent) {
      this.user.isWinner = true;
      this.endGame();
    } else if (this.pc.points > fiftyPercent) {
      this.pc.isWinner = true;
      this.endGame();
    }
  },

  endGame: async function () {
    fieldContainer.removeEventListener('click', this.makeBlockGreen);
    playBtn.textContent = 'Play again';

    const winner = {
      winner: this.user.isWinner ? this.user.name : this.pc.name,
      date: this.getCurrentDate(),
    };

    document.querySelector(
      '.winner-msg'
    ).textContent = `${winner.winner} wins!`;
    await axios.post(
      'https://starnavi-frontend-test-task.herokuapp.com/winners',
      winner
    );
  },

  getCurrentDate: function () {
    const currentDate = new Date();
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthNum = currentDate.getMonth();
    const month = months[monthNum];
    let date = currentDate.getDate();
    const year = currentDate.getFullYear();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();

    date = date < 10 ? '0' + date : date;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}; ${date} ${month} ${year}`;
  },

  showAlert: function (message) {
    const div = document.createElement('div');
    div.classList.add('error');
    div.textContent = message;
    document.querySelector('.game_section').insertBefore(div, fieldContainer);
    setTimeout(() => {
      div.remove();
    }, 3000);
  },

  setDefaultValues: async function (mode, name) {
    fieldContainer.innerHTML = '';
    document.querySelector('.winner-msg').textContent = '';
    playBtn.textContent = 'Play';
    this.mode = mode;
    this.user.name = name;
    this.gameOver = false;
    this.user.points = 0;
    this.pc.points = 0;
    this.user.isWinner = false;
    this.pc.isWinner = false;
    await this.getGameSettings();
    this.createGameField(this.fieldBlocksNum);
  },
};

// Leader Board
const winnersList = document.querySelector('.winners_list');
document.addEventListener('DOMContentLoaded', getWinners);

async function getWinners() {
  const response = await axios.get(
    'https://starnavi-frontend-test-task.herokuapp.com/winners'
  );
  const markup = response.data.reduce((acc, { winner, date }) => {
    return (acc += `
    <li class="collection-item">
      <div class="winner-item">
        <span class="truncate">${winner}</span>
        <span>${date}</span>
        <a href="#!" class="secondary-content">
          <i class="material-icons">grade</i>
        </a>
      </div>
    </li>
    `);
  }, '');
  winnersList.insertAdjacentHTML('beforeend', markup);
}