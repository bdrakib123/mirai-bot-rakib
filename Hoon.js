// ==================== hoon.js ====================
const { spawn } = require("child_process");
const express = require("express");
const path = require("path");

// ==================== Logger ====================
function logger(msg, type = "[ Log ]") {
    console.log(`${type} ${msg}`);
}

// ==================== Package Info ====================
let pkg = {};
try {
    pkg = require(path.join(__dirname, "package.json"));
} catch (err) {
    logger(`Failed to load package.json: ${err.message}`, "[ Error ]");
}
const BOT_NAME = pkg.name || "Islamick Bot";
const BOT_VERSION = pkg.version || "5.0.0";
const BOT_DESC = pkg.description || "Islamick Chat Bot";

// ==================== Express Server ====================
const app = express();
const port = process.env.PORT || 8080;

// Ping route for Uptime Robot
app.get("/", (req, res) => res.send("Bot is alive!"));

// Start server
app.listen(port, () => logger(`Server running on port ${port}...`, "[ Server ]"));

// ==================== Global Error Handling ====================
process.on('unhandledRejection', (reason, p) => {
    logger(`Unhandled Rejection at: Promise ${p} reason: ${reason}`, "[ Error ]");
});

process.on('uncaughtException', (err) => {
    logger(`Uncaught Exception: ${err}`, "[ Error ]");
});

// ==================== Start Bot Function ====================
function startBot() {
    logger("Starting Cyber.js bot...", "[ Bot ]");

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "Cyber.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (code) => {
        logger(`Bot exited with code ${code}. Restarting in 5s...`, "[ Bot ]");
        setTimeout(() => startBot(), 5000); // 5 সেকেন্ড পরে restart
    });

    child.on("error", (err) => {
        logger(`Child process error: ${err}`, "[ Error ]");
    });
}

// ==================== Start Bot ====================
logger(`${BOT_NAME} v${BOT_VERSION} - ${BOT_DESC}`, "[ Info ]");
startBot();
