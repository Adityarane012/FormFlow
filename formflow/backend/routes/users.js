const express = require("express");
const router = express.Router();
const { findUserByEmail } = require("../controllers/userController");

router.get("/find", findUserByEmail);

module.exports = router;
