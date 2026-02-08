const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'cities.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowed.includes(ext)) {
            return cb(new Error('不支持的图片格式'));
        }
        cb(null, crypto.randomBytes(12).toString('hex') + ext);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.json());

// Read cities data
function readCities() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return { cities: [] };
    }
}

// Write cities data
function writeCities(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET all cities
app.get('/api/cities', function (req, res) {
    res.json(readCities());
});

// POST new city
app.post('/api/cities', upload.single('image'), function (req, res) {
    var body = req.body;

    // Validate required fields
    if (!body.twinName || !body.lat || !body.lng) {
        return res.status(400).json({ error: '缺少必填字段' });
    }

    var lat = parseFloat(body.lat);
    var lng = parseFloat(body.lng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ error: '坐标无效' });
    }

    // Sanitize text inputs
    function sanitize(str) {
        if (!str) return '';
        return String(str).replace(/[<>]/g, '').trim().substring(0, 1000);
    }

    var tags = [];
    if (body.tags) {
        tags = String(body.tags).split(',')
            .map(function (t) { return t.replace(/[<>]/g, '').trim(); })
            .filter(function (t) { return t.length > 0; })
            .slice(0, 10);
    }

    var city = {
        id: crypto.randomBytes(8).toString('hex'),
        twinName: sanitize(body.twinName),
        realName: sanitize(body.realName || ''),
        realLocation: sanitize(body.realLocation || ''),
        category: ['rpg', 'scifi', 'fantasy', 'anime'].includes(body.category) ? body.category : 'rpg',
        lat: lat,
        lng: lng,
        description: sanitize(body.description || ''),
        tags: tags,
        image: req.file ? '/uploads/' + req.file.filename : '',
        createdAt: new Date().toISOString()
    };

    var data = readCities();
    data.cities.push(city);
    writeCities(data);

    res.json({ ok: true, city: city });
});

app.listen(PORT, function () {
    console.log('Twinrealm running at http://localhost:' + PORT);
});
