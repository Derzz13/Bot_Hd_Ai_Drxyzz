import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).send("Method not allowed");

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Gagal parsing file" });

    const imageFile = files.image[0];
    const fileData = fs.readFileSync(imageFile.filepath);

    // ✅ Langsung pakai API Key kamu (aman di backend)
    const REPLICATE_API_KEY = "r8_PAYUuaHy5nrxLiMNrQlTfxqExvlgYJx4bu5us";

    // Upload gambar ke Replicate
    const upload = await fetch("https://api.replicate.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body: fileData,
    });

    const uploadData = await upload.json();
    const imageUrl = uploadData.url;

    // Jalankan model Real-ESRGAN
    const modelVersion =
      "ac614f2368a8d22a704b4346e5d59352d13dfeb3d3b17ccda00955cfa51dff83";

    const prediction = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: modelVersion,
          input: { image: imageUrl },
        }),
      }
    );

    const predData = await prediction.json();

    // Tunggu hingga hasil selesai diproses
    let outputUrl = null;
    while (!outputUrl) {
      const poll = await fetch(
        `https://api.replicate.com/v1/predictions/${predData.id}`,
        {
          headers: { Authorization: `Token ${REPLICATE_API_KEY}` },
        }
      );
      const pollData = await poll.json();
      if (pollData.status === "succeeded") {
        outputUrl = pollData.output[0];
      } else if (pollData.status === "failed") {
        return res
          .status(500)
          .json({ error: "AI gagal memproses gambar 😢" });
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    res.status(200).json({ output: outputUrl });
  });
}
