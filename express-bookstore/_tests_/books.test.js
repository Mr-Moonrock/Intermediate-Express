process.env.NODE_ENV = 'test'

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let book_isbn;

beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO 
    books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES(
      '123412341',
      'https://amazon.com/apples',
      'Baby',
      'English',
      200,
      'Barbie Productions',
      'Kens Books', 2024)
      RETURNING isbn`);
  
  book_isbn = result.rows[0].isbn;
});

describe('POST /books', function () {
  test('Creates a new book', async function () {
    const response = await request(app)
      .post(`/books`)
      .send({
        isbn: '98765432',
        amazon_url: 'https://barbie.com',
        author: 'Kentest',
        language: 'english',
        pages: 200,
        publisher: 'Barbie Productions',
        title: 'Barbie World',
        year: 2024
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toHaveProperty('isbn');
  });

  test('Prevents creating book without required title', async function () {
    const response = await request(app)
      .post(`/books`)
      .send({year: 2024});
    expect(response.statusCode).toBe(400);
  });
});

describe('GET /books', function () {
  test('Gets a list of 1 book', async function () {
    const response = await request(app).get(`/books`);
    const books = response.body.books;
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty('isbn');
    expect(books[0]).toHaveProperty('amazon_url');
  });
});

describe('PUT /books/:id', function () {
  test('Updates a single book', async function () {
    const response = await request(app) 
      .put(`/books/${book_isbn}`)
      .send({
          amazon_url: 'https://barbie.com',
          author: 'Kentest',
          language: 'english',
          pages: 150,
          pushlisher: 'Barbie Productions',
          title: 'Update the Book',
          year: 2020
      });
    expect(response.body.book).toHaveProperty('isbn');
    expect(response.body.book.title).toBe('Update the Book');
  });

  test('Prevents a bad book update', async function () {
    const response = await request(app)
      .put(`/books/${book_isbn}`)
      .send({
        isbn: '65432178',
        badField: 'Do not add me!',
        amazon_url: 'https://barbie.com',
        author: 'Kentest',
        language: 'english',
        pages: 150,
        publisher: 'Who knows',
        year: 2010
      });
    expect(response.statusCode).toBe(400);
  });

  test("Responds 404 if can't find book in question", async function () {
    await request(app)
      .delete(`/books/${book_isbn}`)
      const response = await request(app).delete(`/books/${book_isbn}`);
      expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /books/:id', function () {
  test('Deletes a single a book', async function () {
    const response = await request(app)
      .delete(`/books/${book_isbn}`)
    expect(response.body).toEqual({message: 'Book deleted'});
  });
});

afterEach(async function () {
  await db.query('DELETE FROM BOOKS');
});

afterAll(async function () {
  await db.end()
})