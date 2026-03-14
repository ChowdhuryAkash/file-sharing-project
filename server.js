const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Function to get appropriate icon based on file extension
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'xls': 'fa-file-excel',
    'xlsx': 'fa-file-excel',
    'ppt': 'fa-file-powerpoint',
    'pptx': 'fa-file-powerpoint',
    'txt': 'fa-file-text',
    'jpg': 'fa-file-image',
    'jpeg': 'fa-file-image',
    'png': 'fa-file-image',
    'gif': 'fa-file-image',
    'svg': 'fa-file-image',
    'mp4': 'fa-file-video',
    'avi': 'fa-file-video',
    'mp3': 'fa-file-audio',
    'wav': 'fa-file-audio',
    'zip': 'fa-file-archive',
    'rar': 'fa-file-archive',
    'js': 'fa-file-code',
    'css': 'fa-file-code',
    'html': 'fa-file-code',
    'json': 'fa-file-code'
  };
  return iconMap[ext] || 'fa-file-alt';
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
  // Prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const files = fs.readdirSync(uploadsDir).map(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const owner = file.split('_')[0] || 'unknown';
    return {
      name: file,
      size: stats.size,
      modified: stats.mtime,
      owner: owner
    };
  });

  // Get unique owners
  const owners = [...new Set(files.map(f => f.owner))].sort();

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>File Share - Uploaded Files (v${Date.now()})</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css?v=${Date.now()}" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css?v=${Date.now()}" rel="stylesheet">
  <style>
    body {
      background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-attachment: fixed;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 25px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      padding: 3rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
    }
    @media (max-width: 768px) {
      .container {
        padding: 1.5rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
        border-radius: 15px;
      }
    }
    @media (max-width: 576px) {
      .container {
        padding: 1rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
    }
    .header h1 {
      font-size: 3.5rem;
    }
    @media (max-width: 768px) {
      .header h1 {
        font-size: 2.5rem;
      }
    }
    @media (max-width: 576px) {
      .header h1 {
        font-size: 2rem;
      }
    }
    .header .lead {
      font-size: 1.25rem;
    }
    @media (max-width: 768px) {
      .header .lead {
        font-size: 1.1rem;
      }
    }
    @media (max-width: 576px) {
      .header .lead {
        font-size: 1rem;
      }
    }
    .personal-section {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #3a7bd5 50%, #00d2d3 75%, #54a0ff 100%);
      background-size: 300% 300%;
      animation: personalGradient 8s ease infinite;
      color: white;
      padding: 1.5rem;
      border-radius: 20px;
      margin-bottom: 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(30, 60, 114, 0.3);
    }
    @media (max-width: 768px) {
      .personal-section {
        padding: 1rem;
        border-radius: 15px;
        margin-bottom: 1.5rem;
      }
    }
    @media (max-width: 576px) {
      .personal-section {
        padding: 0.75rem;
        margin-bottom: 1rem;
      }
    }
    @keyframes personalGradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .personal-section::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 4s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    .personal-section h3 {
      margin-bottom: 0.25rem;
      font-weight: 700;
      font-size: 1.5rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    @media (max-width: 768px) {
      .personal-section h3 {
        font-size: 1.25rem;
      }
    }
    @media (max-width: 576px) {
      .personal-section h3 {
        font-size: 1.1rem;
      }
    }
    .quote {
      font-style: italic;
      margin: 0.5rem 0;
      font-size: 1rem;
      opacity: 0.9;
    }
    @media (max-width: 768px) {
      .quote {
        font-size: 0.9rem;
        margin: 0.25rem 0;
      }
    }
    @media (max-width: 576px) {
      .quote {
        font-size: 0.8rem;
      }
    }
    .linkedin-btn {
      background: linear-gradient(45deg, #0077b5, #005885, #003d5c);
      background-size: 200% 200%;
      animation: buttonGlow 3s ease infinite;
      border: none;
      color: white;
      padding: 0.875rem 2rem;
      border-radius: 30px;
      text-decoration: none;
      display: inline-block;
      margin-top: 0.5rem;
      font-weight: 600;
      box-shadow: 0 6px 20px rgba(0,119,181,0.4);
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
      z-index: 2;
    }
    @media (max-width: 768px) {
      .linkedin-btn {
        padding: 0.75rem 1.5rem;
        font-size: 0.9rem;
      }
    }
    @media (max-width: 576px) {
      .linkedin-btn {
        padding: 0.625rem 1.25rem;
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }
    }
    @keyframes buttonGlow {
      0%, 100% { background-position: 0% 50%; box-shadow: 0 6px 20px rgba(0,119,181,0.4); }
      50% { background-position: 100% 50%; box-shadow: 0 8px 25px rgba(0,119,181,0.6); }
    }
    .linkedin-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    .linkedin-btn:hover::before {
      left: 100%;
    }
    .linkedin-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,119,181,0.4);
      color: white;
      text-decoration: none;
    }
    .top-bar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .header {
      text-align: left;
      margin-bottom: 0;
      color: #2c3e50;
    }
    .filter-section {
      margin-bottom: 0;
      text-align: left;
      position: relative;
    }
    .filter-container {
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 50%, rgba(233,236,239,0.9) 100%);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 20px;
      padding: 2rem 2.5rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      display: inline-block;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      min-width: 280px;
      max-width: 420px;
    }
    .filter-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.05), transparent);
      transition: left 0.6s ease;
    }
    .filter-container:hover::before {
      left: 100%;
    }
    .filter-container:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      border-color: rgba(52, 152, 219, 0.2);
    }
    .filter-icon {
      font-size: 1.5rem;
      color: #3498db;
      margin-bottom: 0.5rem;
      display: block;
    }
    .filter-label {
      font-weight: 700;
      color: #2c3e50;
      font-size: 1.1rem;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
    }
    .filter-select {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border: 2px solid rgba(52, 152, 219, 0.2);
      border-radius: 15px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      color: #2c3e50;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      min-width: 200px;
      cursor: pointer;
    }
    .filter-select:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
      outline: none;
      transform: scale(1.02);
    }
    .filter-select:hover {
      border-color: #2980b9;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }
    .filter-select option {
      padding: 0.5rem;
      background: #ffffff;
      color: #2c3e50;
    }
    @media (max-width: 768px) {
      .top-bar {
        flex-direction: column;
        gap: 1.5rem;
      }
      .filter-container {
        padding: 1.5rem 2rem;
      }
      .filter-select {
        min-width: 180px;
        padding: 0.6rem 1.2rem;
      }
    }
    @media (max-width: 576px) {
      .top-bar {
        gap: 1rem;
      }
      .filter-container {
        padding: 1.25rem 1.5rem;
      }
      .filter-label {
        font-size: 1rem;
      }
      .filter-select {
        min-width: 160px;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }
    }
    .file-card {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 20px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
    }
    .file-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), rgba(52, 152, 219, 0.1), transparent);
      transition: left 0.6s ease;
      z-index: 1;
    }
    .file-card:hover::before {
      left: 100%;
    }
    .file-card:hover {
      transform: translateY(-12px) scale(1.03);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      border-color: rgba(52, 152, 219, 0.2);
    }
    .file-card .card-body {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.8rem 1.25rem;
      position: relative;
      z-index: 2;
    }
    .file-card .card-body::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 50%;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.3), transparent);
      border-radius: 1px;
      opacity: 0;
      transition: all 0.3s ease;
    }
    .file-card:hover .card-body::after {
      opacity: 1;
      width: 70%;
    }
    @media (max-width: 768px) {
      .file-card .card-body {
        padding: 1.4rem 1.2rem;
      }
    }
    @media (max-width: 576px) {
      .file-card .card-body {
        padding: 1.2rem 1rem;
      }
    }
    .file-icon {
      margin-bottom: 1.5rem;
      position: relative;
    }
    .file-icon i {
      font-size: 3.2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      transition: all 0.3s ease;
    }
    .file-card:hover .file-icon i {
      transform: scale(1.1);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    }
    .file-name {
      font-weight: 700;
      color: #2c3e50;
      font-size: 1rem;
      margin-bottom: 0.35rem;
      line-height: 1.25;
      word-break: break-word;
    }
    .file-info {
      color: #6c757d;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 1.1rem;
      opacity: 0.8;
      transition: all 0.3s ease;
    }
    .file-card:hover .file-info {
      opacity: 1;
      color: #495057;
      transform: translateY(-1px);
    }
    .file-actions {
      margin-top: auto;
    }
    @media (max-width: 768px) {
      .file-name {
        font-size: 0.95rem;
      }
      .file-info {
        font-size: 0.75rem;
        margin-bottom: 1rem;
      }
    }
    @media (max-width: 576px) {
      .file-name {
        font-size: 0.9rem;
      }
      .file-info {
        font-size: 0.7rem;
        margin-bottom: 0.8rem;
      }
    }
    .btn-custom {
      border-radius: 25px;
      padding: 0.5rem 1.5rem;
      font-weight: 500;
      transition: all 0.3s ease;
      border: none;
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.85rem;
    }
    @media (max-width: 576px) {
      .btn-custom {
        padding: 0.4rem 1rem;
        font-size: 0.8rem;
      }
    }
    .btn-custom::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    .btn-custom:hover::before {
      left: 100%;
    }
    .btn-download {
      background: linear-gradient(135deg, #28a745 0%, #20c997 50%, #17a2b8 100%);
      background-size: 200% 200%;
      animation: downloadGlow 4s ease infinite;
      color: white;
      box-shadow: 0 4px 15px rgba(40,167,69,0.3);
      border: 1px solid rgba(40,167,69,0.2);
    }
    .btn-download:hover {
      background: linear-gradient(135deg, #218838 0%, #1aa085 50%, #138496 100%);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(40,167,69,0.5);
      color: white;
    }
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #fd7e14 50%, #e83e8c 100%);
      background-size: 200% 200%;
      animation: deleteGlow 4s ease infinite;
      color: white;
      box-shadow: 0 4px 15px rgba(220,53,69,0.3);
      border: 1px solid rgba(220,53,69,0.2);
    }
    .btn-delete:hover {
      background: linear-gradient(135deg, #c82333 0%, #e8680d 50%, #d63384 100%);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(220,53,69,0.5);
      color: white;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }
    @media (max-width: 768px) {
      .empty-state {
        padding: 2rem;
      }
    }
    @media (max-width: 576px) {
      .empty-state {
        padding: 1.5rem;
      }
      .empty-state i {
        font-size: 3rem;
      }
      .empty-state h3 {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="personal-section">
      <h3>Akash Chowdhury</h3>
      <p class="quote">"Don't worry, I'm here to help you...! If my little effor make you smile, that'st my big pleasure😊"</p>
      <a href="https://www.linkedin.com/in/akash-chowdhury-2b2330249/" class="linkedin-btn" target="_blank">
        <i class="fab fa-linkedin"></i> Let's Connect
      </a>
      <p class="quote">"Overcoming challenges to achieve the impossible"</p>
    </div>
    <div class="top-bar d-flex flex-column flex-md-row align-items-start justify-content-between gap-4">
      <div class="header flex-grow-1">
        <h1 class="display-4 display-5-md"><i class="fas fa-cloud-upload-alt text-primary"></i> File Share</h1>
        <p class="lead lead-sm">Manage your uploaded files</p>
      </div>
      <div class="filter-section flex-shrink-0">
        <div class="filter-container">
          <i class="fas fa-filter filter-icon"></i>
          <label for="ownerFilter" class="filter-label">Filter by Owner</label>
          <select id="ownerFilter" class="filter-select">
            <option value="all">All Owners</option>
            ${owners.map(owner => `<option value="${owner}">${owner}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `;

  if (files.length === 0) {
    html += `
    <div class="empty-state">
      <i class="fas fa-folder-open"></i>
      <h3>No files uploaded yet</h3>
      <p>Upload some files to get started!</p>
    </div>
    `;
  } else {
    html += `
    <div class="row g-4 align-items-stretch" id="fileContainer">
    `;

    files.forEach(file => {
      const sizeFormatted = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(1)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const modifiedFormatted = file.modified.toLocaleDateString() + ' ' + file.modified.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

      html += `
      <div class="col-12 col-sm-6 col-md-6 col-lg-4 mb-3 d-flex align-items-stretch">
        <div class="card file-card h-100" data-owner="${file.owner}">
          <div class="card-body text-center">
            <div class="file-icon mb-3">
              <i class="fas ${getFileIcon(file.name)} fa-3x text-secondary"></i>
            </div>
            <h6 class="card-title file-name">${file.name}</h6>
            <p class="file-info">${sizeFormatted} • ${modifiedFormatted}</p>
            <div class="file-actions d-flex justify-content-center gap-2 flex-wrap mt-3">
              <a href="/download/${file.name}" class="btn btn-custom btn-download">
                <i class="fas fa-download"></i> Download
              </a>
              <a href="/delete/${file.name}" class="btn btn-custom btn-delete" onclick="return confirm('Are you sure you want to delete this file?')">
                <i class="fas fa-trash"></i> Delete
              </a>
            </div>
          </div>
        </div>
      </div>
      `;
    });

    html += `
    </div>
    `;
  }

  html += `
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js?v=${Date.now()}"></script>
  <script>
    document.getElementById('ownerFilter').addEventListener('change', function() {
      const selectedOwner = this.value;
      const cards = document.querySelectorAll('.file-card');
      
      cards.forEach(card => {
        if (selectedOwner === 'all' || card.getAttribute('data-owner') === selectedOwner) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  </script>
</body>
</html>
  `;

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