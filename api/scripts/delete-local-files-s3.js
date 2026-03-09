const { join } = require('path');
const { readdirSync, unlinkSync } = require('fs');
const {
  DB
} = require('../migrations/lib');

const publicDir = join(__dirname, '..', 'public');
const videoDir = join(__dirname, '..', 'public', 'videos');
const photoDir = join(__dirname, '..', 'public', 'photos');

function readdirRecursiveSync(dir) {
  const dirs = readdirSync(dir, { withFileTypes: true });
  return dirs.reduce((acc, file) => {
    const filePath = join(dir, file.name);
    return acc.concat(
      file.isDirectory() ? readdirRecursiveSync(filePath) : filePath
    );
  }, []);
}

async function deleteLocalFile(filePaths) {
  await filePaths.reduce(async (lp, fp) => {
    await lp;
    const name = fp.replace(publicDir, '');
    const file = await DB.collection('files').findOne({
      path: {
        $regex: name
      }
    });
    if (file && file.server === 's3') {
      unlinkSync(fp);
    } else if (!file) {
      unlinkSync(fp);
    }
    return Promise.resolve();
  }, Promise.resolve());
}

module.exports = async () => {
  const videoFiles = readdirRecursiveSync(videoDir);
  await deleteLocalFile(videoFiles);

  const photoFiles = readdirRecursiveSync(photoDir);
  await deleteLocalFile(photoFiles);
};
