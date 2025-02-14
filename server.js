require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error: ", err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: false,
    saveUninitialized: true,
}));

// User Model
const User = mongoose.model("User", new mongoose.Schema({
    username: String,
    password: String
}));

// Middleware: Protect Pages
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect("/login");
}

// Routes
app.get("/", (req, res) => res.send("🏠 Home Page. <a href='/dashboard'>Go to Dashboard</a>"));

app.get("/register", (req, res) => res.send("<form action='/register' method='POST'><input type='text' name='username' placeholder='Username' required/><input type='password' name='password' placeholder='Password' required/><button type='submit'>Register</button></form>"));
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect("/login");
});

app.get("/login", (req, res) => res.send("<form action='/login' method='POST'><input type='text' name='username' placeholder='Username' required/><input type='password' name='password' placeholder='Password' required/><button type='submit'>Login</button></form>"));
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        return res.redirect("/dashboard");
    }

    res.send("❌ Invalid credentials. <a href='/login'>Try again</a>");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
    res.send(`🔐 Welcome, ${req.session.user.username}! <a href='/logout'>Logout</a>`);
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
