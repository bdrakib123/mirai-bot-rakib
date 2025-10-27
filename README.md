# ⚡ 𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️

<p align="center">
  <img src="https://i.imgur.com/hsd22cv.jpeg" alt="Bot Preview" width="400" style="border-radius:20px; box-shadow:0 0 35px rgba(0,255,255,0.8); background: linear-gradient(135deg,#00ffff33,#ff00ff33); padding:15px; border:1px solid rgba(255,255,255,0.2);">
</p>

---

## 📌 About This Bot
**A Messenger Multi-Device Bot** designed to take your Messenger to another level.  
It can download photos, videos, stickers, movies, adult content, and many other things automatically.

---

## 🧩 File Overview

| File/Folder | Purpose | Run/Use |
|-------------|---------|---------|
| `Hoon.js` / `index.js` | Main bot file | `node Hoon.js` |
| `package.json` | Dependencies & scripts info | `npm install` |
| `appstate.json` | Bot login session/token | Auto-used |
| `modules/` | All bot commands (JS files) | Auto-loaded |
| `README.md` | Documentation / Preview | ❌ Not for running |
| `config.json` (if exists) | Bot configuration: prefix, owner, etc. | Auto-used |
| `baby.js` / other auto files | Optional auto-runners or AI scripts | Auto-used if required |

> ⚠️ Only `.js` and necessary JSON files run the bot. Images and Markdown are for display/documentation.

---

## 🚀 How To Run Locally

```bash
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
    # Step to check out the repository code
    - uses: actions/checkout@v2

    # Step to set up the specified Node.js version
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}

    # Step to install dependencies
    - name: Install dependencies
      run: npm install

    # Step to run the bot with the correct port
    - name: Start the bot
      env:
        PORT: 8080
      run: npm start
