const { spawn } = require("child_process");
const log = require("./logger/log.js");
require('dotenv').config(); // Charger les variables d'environnement depuis le fichier .env
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route pour la vérification du webhook
app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Route pour recevoir les messages
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.sendStatus(200);
});

function startProject() {
    const child = spawn("node", ["Goat.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (code) => {
        if (code == 2) {
            log.info("Restarting Project...");
            startProject();
        }
    });
}

startProject();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
