const express = require('express');
const bcrypt = require('bcrypt');
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require('../config');

class User {
  constructor({username, password, first_name, last_name, phone, join_at, login_at }) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
    this.join_at = join_at;
    this.login_at = login_at;
  }
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register({username, password, first_name, last_name, phone}) {
    if (!username || !password) {
      throw new ExpressError('Please enter a username/password', 400)
    } 

    const hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    const results = await db.query (`

    INSERT INTO users (username, password, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING username, first_name, last_name, phone`,
      [username, hashedPw, first_name, last_name, phone]);

    return new User(results.rows[0])
  }

  /** Authenticate: is this username/password valid? Returns boolean. */
  static async authenticate(username, password) {
    if(!username || !password) {
      return new ExpressError('Invalid username/password', 400)
    }

    const results = await db.query(`
      SELECT username, password 
      FROM users 
      WHERE username = $1 AND password = $2`, [username, password]);

    return results.rows.length > 0; 
  }

  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) { 
    // get current timestamp
    const loginTime = new Date().toISOString();
    // find the username in db and update with current timestamp
    const results = await db.query(`

      UPDATE users
      SET last_login_at = $1
      WHERE username = $2
      RETURNING username, last_login_at`,
      [loginTime, username]);

     // throw error if user can't be found 
    if (results.rows.length === 0) {
      throw new ExpressError('User not found', 400)
    }
     //if found, return updated user 
    return new User(results.rows[0])
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */
  static async all() { 
    const results = await db.query(
      `SELECT username,
      first_name AS "firstName",
      last_name AS "lastName",
      phone
      FROM users
      ORDER BY username`);
    return results.rows.map(u => new User(u));
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */
  static async get(username) { 
    const results = await db.query(
      `SELECT username,
        first_name AS "firstName",
        last_name AS "lastName",
        phone, join_at, last_login_at
      FROM users 
      WHERE username = $1`, 
      [username]);

    const user = results.rows[0];

    if (!results.rows[0]) {
      throw new ExpressError(`${username} not found!`, 404);
    }
    return new User(user)
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */
  static async messagesFrom(username) { 
    const results = await db.query(`
      SELECT messages.id,
             users.username AS to_user_username,
             users.first_name AS to_user_first_name,
             users.last_name AS to_user_last_name,
             users.phone AS to_user_phone,
             messages.body,
             messages.sent_at,
             messages.read_at
      FROM messages
      INNER JOIN users ON messages.to_username = users.username
      WHERE messages.from_username = $1
      ORDER BY messages.sent_at DESC`, 
      [username]);
    
    return results.rows.map(row => ({
      id: row.id,
      to_user: { 
        username: row.to_user_username,
        first_name: row.to_user_first_name,
        last_name: row.to_user_last_name,
        phone: row.to_user_phone,
      },
      body: row.body,
      sent_at: row.sent_at,
      read_at: row.read_at,
    }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */
  static async messagesTo(username) {
    const results = await db.query(`
      SELECT messages.id,
             users.username AS from_user_username,
             users.first_name AS from_user_first_name,
             users.last_name AS from_user_last_name,
             users.phone AS from_user_phone,
             messages.body,
             messages.sent_at,
             messages.read_at
      FROM messages
      INNER JOIN users ON messages.from_username = users.username
      WHERE messages.to_username = $1
      ORDER BY messages.sent_at DESC`,
      [username]);
   
   return results.rows.map(row => ({
    id: row.id,
    from_user: {
      username: row.from_user_username,
      first_name: row.from_user_first_name,
      last_name: row.from_user_last_name,
      phone: row.from_user_phone,
    },
    body: row.body,
    sent_at: row.sent_at,
    read_at: row.read_at,
    }));
  }
}

module.exports = User;