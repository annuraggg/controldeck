import { exec } from "child_process";

export type PM2Process = {
  name: string;
  pm_id: number;
  pid: number;
  pm2_env: {
    status: string;
    restart_time: number;
    pm_uptime: number;
  };
  monit: {
    cpu: number;
    memory: number;
  };
};

export function pm2JList(): Promise<PM2Process[]> {
  return new Promise((resolve, reject) => {
    exec("pm2 jlist", (err, stdout) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(stdout) as PM2Process[]);
      } catch (e) {
        reject(e);
      }
    });
  });
}
