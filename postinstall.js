const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

if (process.env.EAS_BUILD === 'true' || process.env.CI === 'true' || process.platform !== 'win32') {
  console.log('--- Post-install skript je v CI/CD nebo na jiném OS než Windows, přeskakuji. ---');
  process.exit(0);
}

const cacheProjectPath = 'C:\\Users\\Ondra\\Documents\\nosync\\Pina';
const projectModulesPath = path.join(__dirname, 'node_modules');
const targetModulesPath = path.join(cacheProjectPath, 'node_modules');

console.log('--- Spouštím post-install skript pro Expo projekt ---');

if (fs.existsSync(projectModulesPath) && fs.lstatSync(projectModulesPath).isSymbolicLink()) {
  console.log('Složka node_modules je již odkaz, není co dělat.');
  process.exit(0);
}

if (!fs.existsSync(projectModulesPath)) {
  console.log('Složka node_modules neexistuje (možná byla smazána předem), skript končí.');
  process.exit(0);
}

try {
  if (fs.existsSync(targetModulesPath)) {
    console.log('Mažu starou verzi node_modules v cache...');
    execSync(`rmdir /s /q "${targetModulesPath}"`);
  }

  console.log(`Kopíruji node_modules do ${targetModulesPath}`);
  fsExtra.copySync(projectModulesPath, targetModulesPath);

  console.log('Mažu původní složku node_modules...');
  fsExtra.removeSync(projectModulesPath);

  console.log(`Vytvářím odkaz z ${projectModulesPath} na ${targetModulesPath}`);
  execSync(`mklink /D "${projectModulesPath}" "${targetModulesPath}"`);

  console.log('--- Post-install skript úspěšně dokončen! ---');

} catch (error) {
  console.error('Došlo k chybě během post-install skriptu:', error);
  process.exit(1);
}