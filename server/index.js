const express = require("express");
const app = express();
const cors = require("cors");
const { exec } = require('child_process');
const fs = require('fs');
app.use(cors());

const port = 3001;
app.use(express.json());
app.post('/execute', (req, res) => {
  const { command,userId } = req.body;
 
  exec(`cd ${userId}`+ ' && ' + command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (stderr) {
      console.error(`Error executing command: ${stderr}`);
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    console.log(`Command executed successfully: ${command}`);
    res.json({ output: stdout });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



app.post('/init', (req, res) => {
  const { userId } = req.body;
  command = `mkdir ${userId}`
  exec(command, (error, stdout, stderr) => {
    if(directoryExistsSync(userId)) {
      res.json({ output: "Your Session is Already init" });
      return;
    }
    if (error) {
      console.error(`Error executing command: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    if (stderr) {
      console.error(`Error executing command: ${stderr}`);
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    console.log(`Command executed successfully: ${command}`);
    res.json({ output: "succcesfully initialized your session" });
  });
});
app.post('/up', (req, res) => {
  const { userId ,repoName,userName} = req.body;

    downloadRepositoryContents(userName,repoName,userId).then(()=>{
    res.json({ output: "succcesfully downloaded" });
  })
  
});


function directoryExistsSync(path) {
  try {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
  } catch (error) {
    return false;
  }
}


const axios = require('axios');
const path = require('path');

const token = !process.env.GIT_HUB_API_KEY;
const headers = {
    'Authorization': `token ${token}`,
    'X-GitHub-Api-Version': '2022-11-28'
};

async function downloadRepositoryContents(owner, repo, downloadPath) {
    try {
        if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath, { recursive: true });
        }

        await downloadDirectoryContents(owner, repo, '', downloadPath);
        console.log('Repository contents downloaded successfully.');
    } catch (error) {
        console.error('Error downloading repository contents:', error.response ? error.response.data : error.message);
    }
}

async function downloadDirectoryContents(owner, repo, directoryPath, downloadPath) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}`;
        const response = await axios.get(url, { headers });

        for (const item of response.data) {
            const itemPath = path.join(downloadPath, item.path);
            if (item.type === 'dir') {
                if (!fs.existsSync(itemPath)) {
                    fs.mkdirSync(itemPath, { recursive: true });
                }
                await downloadDirectoryContents(owner, repo, item.path, downloadPath);
            } else if (item.type === 'file') {
                await downloadFileContents(owner, repo, item.path, itemPath);
            }
        }
    } catch (error) {
        console.error('Error downloading directory contents:', error.response ? error.response.data : error.message);
    }
}

async function downloadFileContents(owner, repo, filePath, downloadPath) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, { headers });
        const fileContent = Buffer.from(response.data.content, 'base64').toString();
        fs.writeFileSync(downloadPath, fileContent);
        console.log(`Downloaded file: ${downloadPath}`);
    } catch (error) {
        console.error('Error downloading file content:', error.response ? error.response.data : error.message);
    }
}
