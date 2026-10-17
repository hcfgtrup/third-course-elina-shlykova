const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const state = {
  posts: [],
  isLoading: false,
  isSaving: false,
  error: null,
  filter: '',
  editingId: null
};

const loadButton = document.querySelector('#loadButton');
const filterInput = document.querySelector('#filterInput');
const statusElement = document.querySelector('#status');
const statisticsElement = document.querySelector('#statistics');
const postsElement = document.querySelector('#posts');

const postForm = document.querySelector('#postForm');
const titleInput = document.querySelector('#titleInput');
const bodyInput = document.querySelector('#bodyInput');
const saveButton = document.querySelector('#saveButton');
const cancelButton = document.querySelector('#cancelButton');
const formTitle = document.querySelector('#formTitle');

async function loadPosts() {
  state.isLoading = true;
  state.error = null;
  render();

  try {
    const response = await fetch(`${API_URL}?_limit=10`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    state.posts = data;
  } catch (error) {
    state.error = error.message;
  } finally {
    state.isLoading = false;
    render();
  }
}

async function createPost(data) {
  state.isSaving = true;
  state.error = null;
  render();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const created = await response.json();
    const newId = state.posts.length > 0 ? Math.max(...state.posts.map(p => p.id)) + 1 : 1;
    state.posts.push({ ...created, id: newId });
  } catch (error) {
    state.error = error.message;
  } finally {
    state.isSaving = false;
    render();
  }
}

async function updatePost(id, data) {
  state.isSaving = true;
  state.error = null;
  render();

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const updated = await response.json();

    const index = state.posts.findIndex(post => post.id === id);
    if (index !== -1) {
      state.posts[index] = { ...state.posts[index], ...updated };
    }
  } catch (error) {
    state.error = error.message;
  } finally {
    state.isSaving = false;
    render();
  }
}

async function deletePost(id) {
  state.isSaving = true;
  state.error = null;
  render();

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state.posts = state.posts.filter(post => post.id !== id);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.isSaving = false;
    render();
  }
}

function getFilteredPosts(posts, filter) {
  if (!filter) return posts;
  const lower = filter.toLowerCase();
  return posts.filter(post =>
    post.title.toLowerCase().includes(lower) ||
    post.body.toLowerCase().includes(lower)
  );
}

function renderPosts(posts) {
  postsElement.innerHTML = '';
  posts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'post-card';

    const title = document.createElement('h3');
    title.textContent = post.title;
    card.append(title);

    const id = document.createElement('p');
    id.textContent = `id: ${post.id}`;
    card.append(id);

    const body = document.createElement('p');
    body.textContent = post.body;
    card.append(body);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Редактировать';
    editBtn.addEventListener('click', () => startEditing(post));
    actions.append(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deletePost(post.id));
    actions.append(deleteBtn);

    card.append(actions);
    postsElement.append(card);
  });
}

function render() {
  if (state.isLoading) {
    statusElement.textContent = 'Загрузка...';
    postsElement.innerHTML = '';
    statisticsElement.textContent = '';
    return;
  }

  if (state.error) {
    statusElement.textContent = `Ошибка: ${state.error}`;
  } else {
    statusElement.textContent = '';
  }

  if (state.posts.length === 0) {
    if (!state.error && !state.isLoading) {
      statusElement.textContent = 'Данные ещё не загружены.';
    }
    postsElement.innerHTML = '';
    statisticsElement.textContent = '';
    return;
  }

  const filtered = getFilteredPosts(state.posts, state.filter);
  renderPosts(filtered);

  statisticsElement.textContent =
    `Всего: ${state.posts.length} | Отображается: ${filtered.length}`;

  saveButton.disabled = state.isSaving;
}

function resetForm() {
  state.editingId = null;
  postForm.reset();
  formTitle.textContent = 'Создать публикацию';
  saveButton.textContent = 'Сохранить';
  cancelButton.classList.add('hidden');
  titleInput.focus();
}

function startEditing(post) {
  state.editingId = post.id;
  titleInput.value = post.title;
  bodyInput.value = post.body;
  formTitle.textContent = `Редактирование записи #${post.id}`;
  saveButton.textContent = 'Сохранить изменения';
  cancelButton.classList.remove('hidden');
  titleInput.focus();
}

postForm.addEventListener('submit', event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    state.error = 'Заполните заголовок и текст публикации';
    render();
    return;
  }

  const data = { title, body, userId: 1 };

  if (state.editingId === null) {
    createPost(data).then(() => resetForm());
  } else {
    updatePost(state.editingId, data).then(() => resetForm());
  }
});

cancelButton.addEventListener('click', resetForm);

loadButton.addEventListener('click', loadPosts);

filterInput.addEventListener('input', event => {
  state.filter = event.target.value;
  render();
});

render();