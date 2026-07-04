const fs = require('fs-extra');
const path = require('path');

/**
 * Delete a file if it exists
 * @param {string} relativePath - e.g. "public/image.jpg"
 */
const deleteFile = async (relativePath) => {
  if (!relativePath) return;
  
  try {
    const absolutePath = path.join(process.cwd(), relativePath);
    if (await fs.pathExists(absolutePath)) {
      await fs.remove(absolutePath);
      console.log(`Deleted file: ${absolutePath}`);
    }
  } catch (err) {
    console.error(`Error deleting file ${relativePath}:`, err.message);
  }
};

module.exports = { deleteFile };
