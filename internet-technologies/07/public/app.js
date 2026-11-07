const API_URL = '/api/books';

let books = [];
let loading = false;

const bookForm = document.getElementById('book-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const yearInput = document.getElementById('year');
const messageEl = document.getElementById('message');
const listEl = document.getElementById('book-list');
const refreshBtn = document.getElementById('refresh-btn');

async function request(url, options = {}) {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    let message = 'HTTP ' + response.status;
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function showMessage(text, isError = true) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#d9534f' : '#28a745';
  setTimeout(() => { messageEl.textContent = ''; }, 3000);
}

async function refreshBooks() {
  loading = true;
  render();
  try {
    books = await request(API_URL);
  } catch (error) {
    showMessage('Ошибка загрузки: ' + error.message);
    books = [];
  } finally {
    loading = false;
    render();
  }
}

function render() {
  listEl.innerHTML = '';

  if (loading) {
    listEl.innerHTML = '<li>Загрузка...</li>';
    return;
  }

  if (books.length === 0) {
    listEl.innerHTML = '<li>Список пуст</li>';
    return;
  }

  for (const book of books) {
    const li = document.createElement('li');
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'book-info';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'book-title';
    titleDiv.textContent = book.title;
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'book-details';
    detailsDiv.textContent = `${book.author} (${book.year || 'год не указан'}) — ${book.available ? 'Доступна' : 'Выдана'}`;

    infoDiv.append(titleDiv, detailsDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Изменить';
    editBtn.addEventListener('click', () => editBook(book));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => deleteBook(book.id));

    actionsDiv.append(editBtn, deleteBtn);
    li.append(infoDiv, actionsDiv);
    listEl.appendChild(li);
  }
}

async function createBook(data) {
  try {
    await request(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    showMessage('Книга добавлена', false);
    await refreshBooks();
  } catch (error) {
    showMessage('Ошибка: ' + error.message);
  }
}

async function editBook(book) {
  const newTitle = prompt('Введите новое название:', book.title);
  if (newTitle === null) return;
  
  const newAvailable = confirm('Книга доступна? (ОК - да, Отмена - нет)');

  try {
    await request(`${API_URL}/${book.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), available: newAvailable })
    });
    showMessage('Книга обновлена', false);
    await refreshBooks();
  } catch (error) {
    showMessage('Ошибка: ' + error.message);
  }
}

async function deleteBook(id) {
  if (!confirm('Вы уверены, что хотите удалить книгу?')) return;

  try {
    await request(`${API_URL}/${id}`, { method: 'DELETE' });
    showMessage('Книга удалена', false);
    await refreshBooks();
  } catch (error) {
    showMessage('Ошибка удаления: ' + error.message);
  }
}

bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const year = yearInput.value ? Number(yearInput.value) : null;

  if (!title || !author) {
    showMessage('Заполните название и автора');
    return;
  }

  await createBook({ title, author, year, available: true });
  
  bookForm.reset();
});

refreshBtn.addEventListener('click', refreshBooks);

refreshBooks();