# Лабораторная работа №4 — CRUD-интерфейс для публикаций

## Как запустить
Открыть `index.html` через Live Server (VS Code) или любой локальный сервер.
Нажать «Загрузить публикации».

## API
`https://jsonplaceholder.typicode.com/posts`
Учебный сервис. Принимает запросы, но не сохраняет изменения в базе.

## HTTP-методы
- `GET /posts?_limit=10` — загрузка списка
- `POST /posts` — создание
- `PATCH /posts/:id` — редактирование
- `DELETE /posts/:id` — удаление

## Состояние приложения
```js
{
  posts: [],        // массив публикаций
  isLoading: false, // идёт загрузка списка
  isSaving: false,  // идёт сохранение/удаление
  error: null,      // текст ошибки
  filter: '',       // строка поиска
  editingId: null   // id редактируемой записи (null = создание)
}

## Скриншоты запросов из DevTools → Network

Ниже представлены скриншоты вкладки Network для всех четырёх CRUD-операций.

### 1. GET — Загрузка публикаций
Запрос `GET /posts?_limit=10`. Статус `200 OK`. В ответе приходит массив из 10 публикаций.

<div align="center">
  <img src="screenshots/get.png" alt="GET запрос" width="800">
  <br>
  <em>Рис. 1. Запрос GET (200 OK)</em>
</div>

<br>

### 2. POST — Создание публикации
Запрос `POST /posts`. Статус `201 Created`. В Request Payload передается JSON с заголовком и текстом новой записи. Сервер возвращает объект с новым ID.

<div align="center">
  <img src="screenshots/post.png" alt="POST запрос" width="800">
  <br>
  <em>Рис. 2. Запрос POST (201 Created)</em>
</div>

<br>

### 3. PATCH — Редактирование публикации
Запрос `PATCH /posts/:id`. Статус `200 OK`. В Request Payload передаются только изменённые поля (в данном случае — заголовок и текст). Сервер возвращает обновленный объект.

<div align="center">
  <img src="screenshots/patch.png" alt="PATCH запрос" width="800">
  <br>
  <em>Рис. 3. Запрос PATCH (200 OK)</em>
</div>

<br>

### 4. DELETE — Удаление публикации
Запрос `DELETE /posts/:id`. Статус `200 OK`. Тело ответа пустое, но локальное состояние приложения обновляется — карточка исчезает с экрана.

<div align="center">
  <img src="screenshots/delete.png" alt="DELETE запрос" width="800">
  <br>
  <em>Рис. 4. Запрос DELETE (200 OK)</em>
</div>