const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

let images = []; // [{ filename, comments: [] }]

// Load images from disk if exists
if (fs.existsSync('images.json')) {
  images = JSON.parse(fs.readFileSync('images.json'));
}

app.get('/api/images', (req, res) => {
  res.json(images);
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  const newImage = {
    filename: req.file.filename,
    comments: []
  };
  images.push(newImage);
  fs.writeFileSync('images.json', JSON.stringify(images));
  res.json(newImage);
});

app.delete('/api/images/:filename', (req, res) => {
  images = images.filter(img => img.filename !== req.params.filename);
  fs.writeFileSync('images.json', JSON.stringify(images));
  fs.unlinkSync(`uploads/${req.params.filename}`);
  res.json({ success: true });
});

app.post('/api/images/:filename/comment', (req, res) => {
  const img = images.find(img => img.filename === req.params.filename);
  if (img) {
    img.comments.push(req.body.comment);
    fs.writeFileSync('images.json', JSON.stringify(images));
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
