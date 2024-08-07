import { platform } from 'os';
import { exec } from 'child_process';
import { appendFile } from 'fs';

const logFile = 'activityMonitor.log';
const commandExecRefreshRate = 500; // I set it to 500ms since 100ms refreshRate leads to running out of memory
const loggingRefreshRate = 600;

const execProcess = (command, callback) => {
    exec(command, (error, stdout) => {
      if (error) {
        process.stdout.write(`exec error: ${error}\r`);
        return;
      }
      callback(stdout.trim());
    });
  };
  

const getCommand = (osPlatform) => {
  switch (osPlatform) {
    case 'darwin':
    case 'linux':
      return 'ps -A -o %cpu,%mem,comm | sort -nr | head -n 1';
    case 'win32':
      return 'powershell "Get-Process | Sort-Object CPU -Descending | Select-Object -Property Name, CPU, WorkingSet -First 1 | ForEach-Object { $_.Name + \\" \\" + $_.CPU + \\" \\" + $_.WorkingSet }"';
    default:
      console.log('Unsupported platform. Nothing to do here..');
      return null;
  }
};

const refreshMetrics = (callback) => {
  const osPlatform = platform();
  const command = getCommand(osPlatform);
  if (command) {
    execProcess(command, callback);
  }
};

const writeToFile = (processInfo) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const logEntry = `${timestamp} : ${processInfo}\n`;
  appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  });
};

process.stdout.write('\x1Bc');
let latestProcessInfo = '';

setInterval(() => {
  refreshMetrics((processInfo) => {
    latestProcessInfo = processInfo;
    process.stdout.write(`\r${processInfo}`);
  });
}, commandExecRefreshRate);

setInterval(() => writeToFile(latestProcessInfo), loggingRefreshRate);
