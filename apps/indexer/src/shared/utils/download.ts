import { bytesToHumanReadableSize } from "./files";
import http from "https";
import fs from "fs";
import { basename } from "path";

const progressLogThrottle = 1000;

export async function download(url: string, path: string) {
  const uri = new URL(url);
  if (!path) {
    path = basename(uri.pathname);
  }
  const file = fs.createWriteStream(path);

  return new Promise<void>(function (resolve, reject) {
    http.get(uri.href).on("response", function (res) {
      if (!res.headers["content-length"]) throw new Error("No content-length header in response");
      const len = parseInt(res.headers["content-length"], 10);
      let downloaded = 0;
      let lastProgressLog = Date.now();
      res
        .on("data", function (chunk) {
          file.write(chunk);
          downloaded += chunk.length;
          const percent = ((100.0 * downloaded) / len).toFixed(2);
          if (Date.now() - lastProgressLog > progressLogThrottle) {
            console.log(`${uri.pathname} - Downloading ${percent}% ${bytesToHumanReadableSize(downloaded)}`);
            lastProgressLog = Date.now();
          }
        })
        .on("end", function () {
          file.end();
          console.log(`${uri.pathname} downloaded to: ${path}`);
          resolve();
        })
        .on("error", function (err) {
          reject(err);
        });
    });
  });
}
