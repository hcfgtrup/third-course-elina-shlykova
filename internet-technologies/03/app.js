const API_URL = 'https://jsonplaceholder.typicode.com/users';

const state = {
  users: [],
  isLoading: false,
  error: null,
  filter: ''
};

const loadButton = document.querySelector('#loadButton');
const reloadButton = document.querySelector('#reloadButton');
const filterInput = document.querySelector('#filterInput');

const statusElement = document.querySelector('#status');
const statisticsElement = document.querySelector('#statistics');
const usersElement = document.querySelector('#users');

async function loadUsers() {
  state.isLoading = true;
  state.error = null;
  render();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }

    const data = await response.json();
    state.users = data;
  } catch (error) {
    state.error = error.message;
  } finally {
    state.isLoading = false;
    render();
  }
}

function getFilteredUsers(users, filter) {
  if (!filter) {
    return users;
  }

  const lowerFilter = filter.toLowerCase();

  return users.filter(user =>
    user.name.toLowerCase().includes(lowerFilter) ||
    user.username.toLowerCase().includes(lowerFilter) ||
    user.email.toLowerCase().includes(lowerFilter)
  );
}

function createUserCard(user) {
  const article = document.createElement('article');
  article.className = 'user-card';

  const nameEl = document.createElement('h3');
  nameEl.textContent = user.name;
  article.append(nameEl);

  const usernameEl = document.createElement('p');
  usernameEl.textContent = `username: ${user.username}`;
  article.append(usernameEl);

  const emailEl = document.createElement('p');
  emailEl.textContent = `email: ${user.email}`;
  article.append(emailEl);

  const cityEl = document.createElement('p');
  cityEl.textContent = `Город: ${user.address.city}`;
  article.append(cityEl);

  const companyEl = document.createElement('p');
  companyEl.textContent = `Компания: ${user.company.name}`;
  article.append(companyEl);

  return article;
}

function getStatistics(users, filteredUsers) {
  const uniqueCities = new Set(users.map(user => user.address.city));

  return {
    total: users.length,
    visible: filteredUsers.length,
    uniqueCities: uniqueCities.size
  };
}

function render() {
  usersElement.innerHTML = '';
  statisticsElement.textContent = '';

  if (state.isLoading) {
    statusElement.textContent = 'Загрузка...';
    return;
  }

  if (state.error) {
    statusElement.textContent = `Ошибка: ${state.error}`;
    return;
  }

  if (state.users.length === 0) {
    statusElement.textContent = 'Данные ещё не загружены.';
    return;
  }

  const filteredUsers = getFilteredUsers(state.users, state.filter);

  statusElement.textContent = 'Данные успешно получены.';
  filteredUsers.forEach(user => {
    usersElement.append(createUserCard(user));
  });

  const stats = getStatistics(state.users, filteredUsers);
  statisticsElement.textContent =
    `Всего: ${stats.total} | Отображается: ${stats.visible} | Уникальных городов: ${stats.uniqueCities}`;
}

loadButton.addEventListener('click', () => {
  loadUsers();
});

reloadButton.addEventListener('click', () => {
  loadUsers();
});

filterInput.addEventListener('input', event => {
  state.filter = event.target.value;
  render();
});

render();