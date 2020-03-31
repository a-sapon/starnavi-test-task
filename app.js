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
}

class GameField {
  constructor(mode) {
    this.mode = mode;
    this.fieldBlocksNum = 0;
  }

  async getGameSettings() {
    try {
      const response = await axios.get(
        'https://starnavi-frontend-test-task.herokuapp.com/game-settings'
      );
      for (let key in response.data) {
        if (key === this.mode) {
          const modeNum = response.data[key].field;
          this.fieldBlocksNum = modeNum * modeNum;
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
}

// firld 250px for easy, 500 for norm, 750 for hard