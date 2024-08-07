const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/*@ Function to execute shell commands with error handling */
const exec = (command, options = {}) => {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
};

/*@ Function to check if a command exists */
const commandExists = (command) => {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/*@ Update and upgrade system packages */
exec('sudo apt-get -y update && sudo apt-get -y upgrade');

/*@ Install required packages */
const packages = ['curl', 'ffmpeg', 'git', 'locales', 'nano', 'python3-pip', 'screen', 'ssh', 'unzip', 'wget'];
exec(`sudo apt-get install -y ${packages.join(' ')}`);

/*@ Set system locale */
exec('sudo localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8');

/*@ Install Node.js if not already installed */
if (!commandExists('node')) {
  exec('curl -sL https://deb.nodesource.com/setup_21.x | sudo -E bash -');
  exec('sudo apt-get install -y nodejs');
}

/*@ Check for ngrok token and exit if not present */
const ngrokToken = process.env.NGROK_TOKEN;
if (!ngrokToken) {
  console.error('NGROK_TOKEN environment variable is required');
  process.exit(1);
}

/*@ Download and set up ngrok */
const ngrokZip = path.join(__dirname, 'ngrok.zip');
exec(`wget -O ${ngrokZip} https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip`);
exec(`unzip ${ngrokZip} -d ${__dirname}`);
fs.unlinkSync(ngrokZip);

/*@ Create and set permissions for the start script */
const startScript = path.join(__dirname, 'start.sh');
fs.writeFileSync(startScript, `#!/bin/bash\n./ngrok config add-authtoken ${ngrokToken}\n./ngrok tcp --region ap 22 &>/dev/null &\n/usr/sbin/sshd -D\n`, { mode: 0o755 });

/*@ Update SSH configuration */
const sshConfig = path.join('/etc/ssh/sshd_config');
const sshConfigData = fs.readFileSync(sshConfig, 'utf8');
if (!sshConfigData.includes('PermitRootLogin yes')) {
  fs.appendFileSync(sshConfig, '\nPermitRootLogin yes\n');
}
if (!sshConfigData.includes('PasswordAuthentication yes')) {
  fs.appendFileSync(sshConfig, 'PasswordAuthentication yes\n');
}

/*@ Change root password */
exec('echo root:kaal | sudo chpasswd');

/*@ Restart SSH service */
exec('sudo service ssh restart');

/*@ Run the start script */
exec(startScript);
