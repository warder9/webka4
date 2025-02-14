require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');

const app = express();

// ===== Middleware =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// ===== Session & Auth =====
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mysecret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ===== Database Connection =====
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';
mongoose
  .connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ===== Routes =====
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// ===== 404 Error Handler =====
app.use((req, res) => {
  res.status(404).render('404', { message: 'Page Not Found' });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
