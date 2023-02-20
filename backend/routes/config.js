const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.get("/", async (req, res) => {
    console.log(`New GET request from ${req.ip} on endpoint /config`);
    try {
        var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../config.json")));

        res.status(200).json({
            config
        });
        console.log("Response sent")
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;