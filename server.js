import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import Replicate from 'replicate';
import { writeFile, unlink } from 'node:fs/promises';
import fetch from 'node-fetch';
import path from 'path';

dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
if(!REPLICATE_TOKEN){
  console.warn('Warning: REPLICATE_API_TOKEN not set in .env — see .env.example');
}
const replicate = new Replicate({ auth: REPLICATE_TOKEN });

// We will run the community model "nightmareai/real-esrgan".
// Inputs supported by the model include image, scale, face_enhance, etc.

app.post('/api/enhance', upload.single('file'), async (req, res) => {
  try{
    if(!req.file) return res.status(400).send('No file uploaded');
    const mime = req.file.mimetype;
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;

    // Start the replicate prediction. Using replicate.run makes it simple.
    // Model: "nightmareai/real-esrgan"
    // Recommended input: image (data URL or public URL), scale (2 or 4), face_enhance (boolean)
    const model = "nightmareai/real-esrgan";
    const input = { image: dataUrl, scale: 2, face_enhance: false };

    console.log('Creating prediction on Replicate for', req.file.originalname);
    const outputs = await replicate.run(model, { input });

    // The replicate.run helper commonly returns an array of output URLs (or a single URL)
    // We'll try to handle both cases.
    let outUrl = null;
    if(Array.isArray(outputs) && outputs.length > 0){
      outUrl = outputs[0];
    } else if(typeof outputs === 'string'){
      outUrl = outputs;
    } else if(outputs && outputs.output){
      // sometimes an object with output field
      outUrl = Array.isArray(outputs.output) ? outputs.output[0] : outputs.output;
    }

    if(!outUrl){
      return res.status(500).send('Replicate did not return an output URL');
    }

    // Fetch the resulting image and pipe to client
    const fetchRes = await fetch(outUrl);
    if(!fetchRes.ok) return res.status(502).send('Failed to fetch output from Replicate');

    const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await fetchRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="enhanced-${req.file.originalname}"`);
    res.send(buffer);

  }catch(err){
    console.error(err);
    res.status(500).send(String(err));
  }
});

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Server running at http://localhost:${port}`));
