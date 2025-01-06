const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Настройка сессий
app.use(session({
    secret: 'your_secret_key', // Замените на ваш секретный ключ
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Установите true, если используете HTTPS
}));

function isAuthenticated(req) {
    return req.session && req.session.userId;
}

// Промежуточное ПО для проверки аутентификации
function ensureAuthenticated(req, res, next) {
    if (isAuthenticated(req)) {
        return next();
    }
    res.redirect('/login');
}

app.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/user', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Ошибка при выходе из системы");
        }
        res.redirect('/login');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT id FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
            return res.status(500).send("Ошибка сервера");
        }
        if (row) {
            req.session.userId = row.id;
            res.redirect('/user');
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/check-auth', (req, res) => {
    res.json({ isAuthenticated: isAuthenticated(req) });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
