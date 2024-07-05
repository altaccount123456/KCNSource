const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs')

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '/public') });
    console.log('Public directory is now being served.')
});

function buildBackgroundIndex() {
  const rootImg = path.join(__dirname, 'public', 'images', 'bg_images')
  
  const imageIndex = {
    bg_autumn: { wxbad: [], wxgood: [] },
    bg_spring: { wxbad: [], wxgood: [] },
    bg_summer: { wxbad: [], wxgood: [] },
    bg_winter: { wxbad: [], wxgood: [] }
  };


  function exploreDirectory(currentDir, category) {

    const folders = fs.readdirSync(currentDir);

    folders.forEach(folder => {

      const folderPath = path.join(currentDir, folder);

      if (fs.statSync(folderPath).isDirectory()) {

        const images = fs.readdirSync(folderPath);

        images.forEach(file => {
          const filePath = path.join('/images', 'bg_images', category, folder, file).replace(/\\/g, '/');
          if (file.includes('wxbad')) {
            imageIndex[category]["wxbad"].push(filePath);
          } else if (file.includes('wxgood')) {
            imageIndex[category]["wxgood"].push(filePath);
          }
        })

        exploreDirectory(folderPath, category);

      }
  });
  }

  exploreDirectory(path.join(rootImg, 'bg_autumn'), 'bg_autumn');
  exploreDirectory(path.join(rootImg, 'bg_spring'), 'bg_spring');
  exploreDirectory(path.join(rootImg, 'bg_summer'), 'bg_summer');
  exploreDirectory(path.join(rootImg, 'bg_winter'), 'bg_winter');
  
  const indexPath = path.join(__dirname, 'public', 'imageIndex.json');
  fs.writeFileSync(indexPath, JSON.stringify(imageIndex, null, 2));
  console.log('Built background image index:', imageIndex)
}

buildBackgroundIndex();

app.listen(3000, () => {
  console.log("###  WEATHER HTML DISPLAY SYSTEM 2  ###");
  console.log('Created by PeytonWX and SSPWXR.')
  console.log('The output can be viewable at http://localhost:3000/');
});