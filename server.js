const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

/* =========================
   FILE UPLOAD
========================= */

app.post("/upload/:filename", (req, res) => {

  const filename = req.params.filename;

  const filepath = path.join(uploadsDir, filename);

  const writeStream = fs.createWriteStream(filepath);

  req.pipe(writeStream);

  writeStream.on("finish", () => {
    res.json({
      message: "Upload successful",
      file: filename
    });
  });

});


/* =========================
   LIST FILES PAGE
========================= */

app.get("/", (req, res) => {

  const files = fs.readdirSync(uploadsDir);

  let html = `
  <h2>Uploaded Files</h2>
  <table border="1" cellpadding="10">
  <tr>
  <th>File</th>
  <th>Download</th>
  <th>Delete</th>
  </tr>
  `;

  files.forEach(file => {

    html += `
    <tr>
      <td>📄 ${file}</td>

      <td>
        <a href="/download/${file}">
          ⬇ Download
        </a>
      </td>

      <td>
        <a href="/delete/${file}" onclick="return confirm('Delete file?')">
          🗑 Delete
        </a>
      </td>
    </tr>
    `;

  });

  html += "</table>";

  res.send(html);

});


/* =========================
   DOWNLOAD
========================= */

app.get("/download/:file", (req, res) => {

  const filePath = path.join(uploadsDir, req.params.file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath);

});


/* =========================
   DELETE
========================= */

app.get("/delete/:file", (req, res) => {

  const filePath = path.join(uploadsDir, req.params.file);

  if (!fs.existsSync(filePath)) {
    return res.send("File not found");
  }

  fs.unlinkSync(filePath);

  res.redirect("/");

});


app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});