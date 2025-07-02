const fs = require('fs');
const path = require('path');

// Function to check all messages.json files in the current directory and subdirectories
function checkMessagesJson(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkMessagesJson(fullPath); // Recursively check subdirectories
        } else if (file === 'messages.json') {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            console.log(content.extName.message.length);
            if (content.extName && content.extName.message.length > 75) {
                console.log(content.extName.message);
                console.log(`Trimming message in ${fullPath}`); // Log the file being modified
                content.extName.message = content.extName.message.split('-')[0]; // Trim to the part before the hyphen
                console.log(content.extName.message);
                fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf-8');
            }
        }
    });
}

// Start checking from the current directory
checkMessagesJson(__dirname);
