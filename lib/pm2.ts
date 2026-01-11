import { exec } from "child_process";

export function pm2JList(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    exec("pm2 jlist", (err, stdout) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
}
