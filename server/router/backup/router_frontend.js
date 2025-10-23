const express = require("express");
const controllers = require("../controllers/frontend/index");

// ROUTER
const router = express.Router();

router.get("/", controllers.main);

module.exports = router;
