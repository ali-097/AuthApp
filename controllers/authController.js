const User = require("../models/User");
const jwt = require("jsonwebtoken");

const handleErrors = (err) => {
	let error = { email: "", password: "" };
	if (err.message === "incorrect email") {
		error.email = "Email not registered";
		return error;
	}
	if (err.message === "incorrect password") {
		error.password = "Incorrect password";
		return error;
	}
	if (err.code === 11000) {
		error.email = "Email already registered";
		return error;
	}
	if (err.message.includes("user validation failed")) {
		Object.values(err.errors).forEach(({ properties }) => {
			error[properties.path] = properties.message;
		});
	}
	return error;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: maxAge,
	});
};

module.exports.getLogin = (req, res) => {
	res.render("login");
};

module.exports.getSignup = (req, res) => {
	res.render("signup");
};

module.exports.postSignup = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.create({ email, password });
		const token = createToken(user._id);
		res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
		res.status(201).json({ user: user._id });
	} catch (err) {
		const error = handleErrors(err);
		res.status(400).json({ error });
	}
};

module.exports.postLogin = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.login(email, password);
		const token = createToken(user._id);
		res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
		res.status(200).json({ user: user._id });
	} catch (err) {
		const error = handleErrors(err);
		res.status(400).json({ error });
	}
};

module.exports.getLogout = (req, res) => {
	res.cookie("jwt", "", { maxAge: 1 });
	res.redirect("/");
};
