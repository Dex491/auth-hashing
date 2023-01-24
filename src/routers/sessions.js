const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma.js");

router.post("/", async (req, res) => {
	// Get the username and password from the request body
	const { username, password } = req.body;

	// Check that a user with that username exists in the database
	const user = await prisma.user.findUnique({
		where: {
			username,
		},
	});

	if (!user) {
		res.status(401).json({ error: "Invalid username or password." });
	}

	// Use bcrypt to check that the provided password matches the hashed password on the user
	// If either of these checks fail, respond with a 401 "Invalid username or password" error
	bcrypt.compare(password, user.password, (err, result) => {
		if (!result) {
			res.status(401).json({ error: "Invalid username or password." });
		} else {
			// Use the JWT_SECRET environment variable for the secret key
			const secret = process.env.JWT_SECRET;

			// If the user exists and the passwords match, create a JWT containing the username in the payload
			const access_token = jwt.sign(
				{ sub: user.id, username: user.username },
				secret
			);

			// Send a JSON object with a "token" key back to the client, the value is the JWT created
			res.status(201).json({ access_token });
		}
	});
});

module.exports = router;
