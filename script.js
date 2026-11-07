
const optionsList = document.getElementById('optionsList');
const addOptionButton = document.querySelector('.add-option');
const createButton = document.querySelector('#creatorView .create-button');
const questionInput = document.getElementById('question');

const MAX_OPTIONS = 10;
const MIN_OPTIONS = 2;


// ======================================
// ЭЛЕМЕНТЫ СТРАНИЦЫ
// ======================================

const heroSection = document.getElementById('heroSection');
const creatorView = document.getElementById('creatorView');
const gamePage = document.getElementById('gamePage');

const friendQuestion = document.getElementById('friendQuestion');
const friendOptions = document.getElementById('friendOptions');
const answerButton = document.getElementById('answerButton');
const friendResult = document.getElementById('friendResult');


// ======================================
// СООБЩЕНИЕ И РЕЗУЛЬТАТ СОЗДАНИЯ
// ======================================

const message = document.createElement('div');
message.className = 'form-message';

createButton.after(message);


const resultBox = document.createElement('div');
resultBox.className = 'result-box';

resultBox.innerHTML = `
  <p>Твоя игра готова! Скопируй ссылку и отправь другу.</p>

  <div class="result-link">
    <input type="text" readonly>
    <button type="button" class="copy-button">
      Копировать
    </button>
  </div>
`;

createButton.after(resultBox);


// ======================================
// ПОКАЗ СООБЩЕНИЙ
// ======================================

function showMessage(text, type = 'error') {
  message.textContent = text;
  message.className = `form-message ${type}`;
}


// ======================================
// ОБНОВЛЕНИЕ ВАРИАНТОВ ОТВЕТА
// ======================================

function updateOptions() {

  const items = optionsList.querySelectorAll('.option-item');

  items.forEach((item, index) => {

    item.querySelector('.option-number').textContent =
      String(index + 1).padStart(2, '0');

    const radio = item.querySelector('input[type="radio"]');
    radio.value = index;

    const input = item.querySelector('input[type="text"]');
    input.placeholder = `Вариант ${index + 1}`;

    const removeButton = item.querySelector('.remove-option');
    removeButton.disabled = items.length <= MIN_OPTIONS;

  });

  addOptionButton.disabled = items.length >= MAX_OPTIONS;

  addOptionButton.innerHTML =
    items.length >= MAX_OPTIONS
      ? '<span>✓</span> Максимум вариантов'
      : '<span>+</span> Добавить вариант';

}


// ======================================
// ДОБАВЛЕНИЕ ВАРИАНТА
// ======================================

addOptionButton.addEventListener('click', () => {

  const items = optionsList.querySelectorAll('.option-item');

  if (items.length >= MAX_OPTIONS) return;

  const item = document.createElement('div');
  item.className = 'option-item';

  item.innerHTML = `
    <span class="option-number"></span>

    <input
      type="text"
      placeholder="Новый вариант"
      maxlength="100"
    >

    <label class="correct-control">
      <input type="radio" name="correct">
      <span class="radio-custom"></span>
    </label>

    <button
      class="remove-option"
      type="button"
      aria-label="Удалить вариант"
    >×</button>
  `;

  optionsList.appendChild(item);

  updateOptions();

  item.querySelector('input[type="text"]').focus();

  resultBox.classList.remove('active');
  message.className = 'form-message';

});


// ======================================
// УДАЛЕНИЕ ВАРИАНТА
// ======================================

optionsList.addEventListener('click', (event) => {

  const button = event.target.closest('.remove-option');

  if (!button) return;

  const items = optionsList.querySelectorAll('.option-item');

  if (items.length <= MIN_OPTIONS) {
    showMessage('Нужно оставить минимум два варианта.');
    return;
  }

  const item = button.closest('.option-item');

  const radio = item.querySelector('input[type="radio"]');
  const wasChecked = radio.checked;

  item.remove();

  if (wasChecked) {

    const firstRadio = optionsList.querySelector(
      'input[type="radio"]'
    );

    firstRadio.checked = true;

  }

  updateOptions();

  resultBox.classList.remove('active');
  message.className = 'form-message';

});


// ======================================
// СБРОС СТАРОГО РЕЗУЛЬТАТА
// ======================================

document.addEventListener('input', (event) => {

  if (
    event.target === questionInput ||
    event.target.closest('.option-item')
  ) {

    resultBox.classList.remove('active');
    message.className = 'form-message';

  }

});

optionsList.addEventListener('change', () => {
  resultBox.classList.remove('active');
});


// ======================================
// СОЗДАНИЕ ИГРЫ
// ======================================

createButton.addEventListener('click', () => {

  const question = questionInput.value.trim();

  const items = [
    ...optionsList.querySelectorAll('.option-item')
  ];

  const answers = items.map(item => {
    return item.querySelector('input[type="text"]').value.trim();
  });


  // Проверяем вопрос

  if (!question) {
    showMessage('Сначала напиши свой вопрос.');
    questionInput.focus();
    return;
  }


  // Проверяем количество вариантов

  if (answers.length < MIN_OPTIONS) {
    showMessage('Добавь минимум два варианта ответа.');
    return;
  }


  // Проверяем заполнение

  if (answers.some(answer => !answer)) {
    showMessage('Заполни все варианты ответа.');
    return;
  }


  // Проверяем выбранный правильный ответ

  const correctRadio = optionsList.querySelector(
    'input[type="radio"]:checked'
  );

  if (!correctRadio) {
    showMessage('Выбери правильный ответ.');
    return;
  }


  // Проверяем повторения

  const normalizedAnswers = answers.map(answer =>
    answer.toLocaleLowerCase('ru')
  );

  if (new Set(normalizedAnswers).size !== answers.length) {
    showMessage('Варианты ответа не должны повторяться.');
    return;
  }


  // Получаем правильный ответ

  const correctIndex = items.findIndex(item =>
    item.querySelector('input[type="radio"]').checked
  );


  // Формируем игру

  const game = {
    question,
    answers,
    correctIndex
  };


  // Создаём ID игры

  const gameId = 'game-' + Date.now() + '-' +
    Math.random().toString(36).substring(2, 10);


  // Сохраняем игру в браузере

  localStorage.setItem(
    `ugaday_${gameId}`,
    JSON.stringify(game)
  );


  // Создаём ссылку

  const gameUrl = new URL(window.location.href);

  gameUrl.searchParams.set('game', gameId);

  const linkInput = resultBox.querySelector('input');

  linkInput.value = gameUrl.toString();


  // Показываем результат

  resultBox.classList.add('active');

  showMessage(
    'Игра создана в демонстрационном режиме!',
    'success'
  );

  resultBox.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

});


// ======================================
// КОПИРОВАНИЕ ССЫЛКИ
// ======================================

resultBox.querySelector('.copy-button').addEventListener(
  'click',
  async () => {

    const linkInput = resultBox.querySelector('input');
    const button = resultBox.querySelector('.copy-button');

    try {

      await navigator.clipboard.writeText(linkInput.value);

      button.textContent = 'Скопировано!';

      setTimeout(() => {
        button.textContent = 'Копировать';
      }, 2000);

    } catch {

      linkInput.select();
      document.execCommand('copy');

    }

  }
);


// ======================================
// ПРОХОЖДЕНИЕ ИГРЫ ДРУГОМ
// ======================================

function openFriendGame(gameId) {

  // Скрываем создание игры

  if (heroSection) {
    heroSection.hidden = true;
  }

  // Показываем страницу прохождения

  if (gamePage) {
    gamePage.hidden = false;
  }


  // Загружаем игру

  const savedGame = localStorage.getItem(`ugaday_${gameId}`);


  // Проверяем существование игры

  if (!savedGame) {

    friendQuestion.textContent = 'Игра не найдена 😔';

    friendOptions.innerHTML = '';

    answerButton.hidden = true;

    return;

  }


  const game = JSON.parse(savedGame);

  let selectedAnswer = null;


  // Показываем вопрос

  friendQuestion.textContent = game.question;

  friendOptions.innerHTML = '';

  friendResult.textContent = '';

  friendResult.className = 'friend-result';

  answerButton.disabled = true;
  answerButton.hidden = false;
  answerButton.textContent = 'Ответить';


  // Создаём варианты

  game.answers.forEach((answer, index) => {

    const option = document.createElement('button');

    option.type = 'button';
    option.className = 'friend-option';
    option.textContent = answer;


    // Выбор ответа

    option.addEventListener('click', () => {

      selectedAnswer = index;

      document.querySelectorAll('.friend-option').forEach(item => {
        item.classList.remove('selected');
      });

      option.classList.add('selected');

      answerButton.disabled = false;

    });


    friendOptions.appendChild(option);

  });


  // Отправка ответа

  answerButton.onclick = () => {

    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === game.correctIndex;


    // Показываем результат

    if (isCorrect) {

      friendResult.textContent =
        '🎉 Ты угадал! Отличный результат!';

      friendResult.className =
        'friend-result correct';

    } else {

      friendResult.textContent =
        `Не угадал! Правильный ответ: ${game.answers[game.correctIndex]}`;

      friendResult.className =
        'friend-result wrong';

    }


    // Блокируем повторный выбор

    document.querySelectorAll('.friend-option').forEach(item => {
      item.disabled = true;
    });

    answerButton.disabled = true;
    answerButton.textContent = 'Ответ отправлен';

  };

}


// ======================================
// ПРОВЕРЯЕМ ССЫЛКУ ПРИ ЗАГРУЗКЕ
// ======================================

const urlParams = new URLSearchParams(window.location.search);

const gameIdFromUrl = urlParams.get('game');

if (gameIdFromUrl) {
  openFriendGame(gameIdFromUrl);
}


// ======================================
// НАЧАЛЬНАЯ НАСТРОЙКА
// ======================================

updateOptions();
