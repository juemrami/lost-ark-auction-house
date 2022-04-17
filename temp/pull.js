import fs from "fs";
import path from "path";

function parseIfMap(filePath, content) {
  console.log("working on:", filePath);
  if (filePath.includes(".map")) {
    const jsonContent = JSON.parse(content);
    jsonContent.sources.forEach(function (value, index) {
      const parsed = path.parse(value);
      if (parsed.dir) {
        fs.mkdirSync(parsed.dir, { recursive: true });
      }
      fs.writeFile(
        value,
        jsonContent.sourcesContent[index],
        (path) => path && console.log(value, path)
      );
    });
  }
}

function readFiles(dirname, onError) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(dirname, err);
      return;
    }
    filenames.forEach(function (filename) {
      const filePath = dirname + path.sep + filename;
      if (fs.lstatSync(filePath).isFile()) {
        fs.readFile(filePath, "utf-8", function (err, content) {
          if (err) {
            onError(err);
            return;
          }
          parseIfMap(filePath, content);
        });
      } else {
        readFiles(filePath, parseIfMap, onError);
      }
    });
  });
}
// change with you own file path
readFiles("temp/", console.log);
