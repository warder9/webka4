const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.render("register", { error: "All fields are required." });
  }
  
  try {
    await User.create({ name, email, password });
    res.redirect('/login');
  } catch (err) {
    res.render("register", { error: "Email already exists." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render("login", { error: "Invalid credentials." });
  }

  req.session.user = user;
  res.redirect("/user/profile");
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
