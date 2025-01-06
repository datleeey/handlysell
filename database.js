const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");

    // Пример добавления пользователя
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run("user1", "password1");
    stmt.finalize();
});

module.exports = db; 