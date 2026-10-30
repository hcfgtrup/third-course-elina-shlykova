const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let books = [
  { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869, available: true },
  { id: 2, title: 'Преступление и наказание', author: 'Достоевский', year: 1866, available: false },
  { id: 3, title: 'Мастер и Маргарита', author: 'Булгаков', year: 1967, available: true },
  { id: 4, title: '1984', author: 'Оруэлл', year: 1949, available: true },
  { id: 5, title: 'Гарри Поттер', author: 'Роулинг', year: 1997, available: false },
  { id: 6, title: 'Хоббит', author: 'Толкин', year: 1937, available: true }
];

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Library API',
    version: 1,
    items: books.length
  });
});

app.get('/api/books', (req, res) => {
  let result = books;

  if (req.query.author) {
    const authorQuery = req.query.author.toLowerCase();
    result = result.filter(b => b.author.toLowerCase().includes(authorQuery));
  }

  if (req.query.available !== undefined) {
    const isAvailable = req.query.available === 'true';
    result = result.filter(b => b.available === isAvailable);
  }

  res.json(result);
});

app.get('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author, year } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'title and author are required' });
  }

  const newBook = {
    id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
    title: String(title).trim(),
    author: String(author).trim(),
    year: year ? Number(year) : null,
    available: true
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});