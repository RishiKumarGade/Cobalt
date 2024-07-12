const axios = require('axios');
const fs = require('fs');
const path = require('path');

const token = 'YOUR API';
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

// Example usage
const owner = 'your_username';
const repo = 'your_repository';
const downloadPath = 'path_to_download_folder';
downloadRepositoryContents(owner, repo, downloadPath);
