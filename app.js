const fieldContainer = document.querySelector('.field');
const gameForm = document.querySelector('.game_form');

gameForm.addEventListener('submit', handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();
  const mode = e.currentTarget.elements.mode.value;
  // const name = e.currentTarget.elements.name.value;
  const gameField = new GameField(mode);
  await gameField.getGameSettings();
  gameField.createGameField(gameField.fieldBlocksNum);

  const blocks = fieldContainer.children;
  const makeBlueId = setInterval(
    () => gameField.makeRandomBlockBlue(blocks),
    gameField.delay
  );
  const makeRedId = setInterval(
    () => gameField.makeBlockRed(blocks, makeBlueId, makeRedId),
    gameField.delay
  );

  const boundMakeBlockGreen = gameField.makeBlockGreen.bind(gameField);
  fieldContainer.addEventListener('click', boundMakeBlockGreen);
}

class GameField {
  constructor(mode) {
    this.mode = mode;
    this.fieldBlocksNum = 0;
    this.delay = 0;
    this.game = 'on';
    this.userPoints = 0;
    this.pcPoints = 0;
  }

  async getGameSettings() {
    try {
      // const response = await axios.get(
      //   'https://starnavi-frontend-test-task.herokuapp.com/game-settings'
      // );
      const response = {
        data: {
          easyMode: {
            field: 5,
            delay: 1000
          },
          normalMode: {
            field: 10,
            delay: 1000
          },
          hardMode: {
            field: 15,
            delay: 900
          }
        }
      };
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
  }

  createGameField(amount) {
    for (let i = 0; i < amount; i += 1) {
      const block = document.createElement('div');
      block.classList.add('field_block');
      fieldContainer.append(block);
    }
  }

  makeRandomBlockBlue(blocks) {
    const randomNum = Math.round(Math.random() * (blocks.length - 1));
    if (!blocks[randomNum].style.backgroundColor) {
      blocks[randomNum].style.backgroundColor = 'rgb(0, 102, 255)';
    } else {
      if (this.game === 'on') {
        this.makeRandomBlockBlue(blocks);
      }
    }
  }

  makeBlockGreen(e) {
    if (!e.target.style.backgroundColor) return;
    if (e.target.style.backgroundColor === 'rgb(0, 102, 255)') {
      e.target.style.backgroundColor = 'rgb(0, 204, 0)';
      this.userPoints += 1;
    }
  }

  makeBlockRed(blocks, makeBlueId, makeRedId) {
    const arr = Array.from(blocks);
    arr.forEach(el => {
      if (!el.style.backgroundColor) return;
      if (el.style.backgroundColor === 'rgb(0, 204, 0)') return;
      setTimeout(() => {
        if (el.style.backgroundColor === 'rgb(0, 102, 255)') {
          el.style.backgroundColor = 'rgb(255, 26, 26)';
          this.pcPoints += 1;
        }
      }, this.delay);
    });

    setTimeout(() => {
      if (arr.every(el => el.style.backgroundColor !== '')) {
        this.endGame(makeBlueId, makeRedId);
        this.game = 'off';
      }
    }, this.delay);
  }

  endGame(interval1, interval2) {
    clearInterval(interval1);
    clearInterval(interval2);
    fieldContainer.removeEventListener('click', this.makeBlockGreen);
  }

}
