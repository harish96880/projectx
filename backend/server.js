const express = require("express");
const AssemblyAI = require("assemblyai").default;
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;
const apiKey = "YOUR_ASSEMBLYAI_API_KEY";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const assemblyaiClient = new AssemblyAI(apiKey);

app.post("/transcribe-audio", async (req, res) => {
  try {
    const audioFile = req.files.audio;
    const audioFilePath = `./uploads/${audioFile.name}`;

    // Save the audio file to disk
    audioFile.mv(audioFilePath, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Error saving audio file" });
      }

      // Transcribe the audio file using AssemblyAI
      const transcript = await assemblyaiClient.transcribe(audioFilePath);

      // Return the transcript
      return res.json({ transcript });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
