require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error: ", err));

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
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

// Middleware: Protect Dashboard
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect("/login");
}

// Routes
app.get("/", (req, res) => res.render("index"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login"));
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
    res.render("dashboard", { username: req.session.user.username });
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
