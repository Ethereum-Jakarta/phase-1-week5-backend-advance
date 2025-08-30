# Logic Nolep (Optional)
Disini kita akan coba deploy Inventory System di railway (cloud service) yang kita pakai sebelumnya. Untuk tugas ini opsional jadi kalian boleh ngerjain atau engga juga gapapa.

## Create New Repo
Buatlah repo baru di github kalian, dan pindahkan semua file Inventory System ke repo baru. Disini kita pisahkan karena khusus project IS yang akan kita deploy ke railway.

contoh repo:
`https://github.com/zexoverz/inventory-system`


## Set Up Production
Sebelum kita deploy, kita perlu bungkus server kita menggunakana env production. ada beberapa hal yang perlu di set up.

buatlah file `ecosystem.config.json` di root project kalian (sejajar dengan package.json)

`ecosystem.config.json`
```json
{
  "apps": [
    {
      "name": "app",
      "script": "src/index.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "time": true,
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```
json ini berfungsi untuk configurasi server kalian di saat production nanti.

lanjut, buat folder `bin` di root project kalian, dan buatlah file didalamnya createNodejsApp.js

`bin/createNodejsApp.js`
```js
#!/usr/bin/env node
const util = require('util');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Utility functions
const exec = util.promisify(require('child_process').exec);
async function runCmd(command) {
  try {
    const { stdout, stderr } = await exec(command);
    console.log(stdout);
    console.log(stderr);
  } catch {
    (error) => {
      console.log(error);
    };
  }
}

async function hasYarn() {
  try {
    await execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Validate arguments
if (process.argv.length < 3) {
  console.log('Please specify the target project directory.');
  console.log('For example:');
  console.log('    npx create-nodejs-app my-app');
  console.log('    OR');
  console.log('    npm init nodejs-app my-app');
  process.exit(1);
}

// Define constants
const ownPath = process.cwd();
const folderName = process.argv[2];
const appPath = path.join(ownPath, folderName);
const repo = 'https://github.com/zexoverz/inventory-system';

// Check if directory already exists
try {
  fs.mkdirSync(appPath);
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('Directory already exists. Please choose another name for the project.');
  } else {
    console.log(err);
  }
  process.exit(1);
}

async function setup() {
  try {
    // Clone repo
    console.log(`Downloading files from repo ${repo}`);
    await runCmd(`git clone --depth 1 ${repo} ${folderName}`);
    console.log('Cloned successfully.');
    console.log('');

    // Change directory
    process.chdir(appPath);

    // Install dependencies
    const useYarn = await hasYarn();
    console.log('Installing dependencies...');
    if (useYarn) {
      await runCmd('yarn install');
    } else {
      await runCmd('npm install');
    }
    console.log('Dependencies installed successfully.');
    console.log();

    // Copy envornment variables
    fs.copyFileSync(path.join(appPath, '.env.example'), path.join(appPath, '.env'));
    console.log('Environment files copied.');

    // Delete .git folder
    await runCmd('npx rimraf ./.git');

    // Remove extra files
    fs.unlinkSync(path.join(appPath, 'CHANGELOG.md'));
    fs.unlinkSync(path.join(appPath, 'CODE_OF_CONDUCT.md'));
    fs.unlinkSync(path.join(appPath, 'CONTRIBUTING.md'));
    fs.unlinkSync(path.join(appPath, 'bin', 'createNodejsApp.js'));
    fs.rmdirSync(path.join(appPath, 'bin'));
    if (!useYarn) {
      fs.unlinkSync(path.join(appPath, 'yarn.lock'));
    }

    console.log('Installation is now complete!');
    console.log();

    console.log('We suggest that you start by typing:');
    console.log(`    cd ${folderName}`);
    console.log(useYarn ? '    yarn dev' : '    npm run dev');
    console.log();
    console.log('Enjoy your production-ready Node.js app, which already supports a large number of ready-made features!');
    console.log('Check README.md for more info.');
  } catch (error) {
    console.log(error);
  }
}

setup();
```

Fungsi createNodejsApp ini adalah membuat server baru dengan versi yang lebih kecil, kita buang file file yang tidak perlu di production agar server kita clean. Disini juga kita implementasi set up modules" yang diperlukan sebelum server dijalankan di production.

<br/>

Setelah changes Set Up Production, jangan lupa push ke repo kalian. 
disini gua push ke branch master

![image](https://github.com/user-attachments/assets/49ec93de-935c-456a-891e-a5fe6f118553)

## Set Up Railway
Sekarang Server Kita sudah ready di deploy, saatnya set up cloud service untuk mengarahkan CI/CD ke repo yang sudah kita buat.

Buka Dashboard Railway kalian , pilih project yang sudah ada database kalian. coba klik kanan, nanti bakal muncul menu seperti ini : 

![image](https://github.com/user-attachments/assets/e0662160-dd83-4ec2-824f-9f66c29d0003)

Klik Github Repo, nanti kalian bakal disuruh login memakai github.
Setelah connect github, railway bisa melihat semua repo kalian. Langsung aja Search repo inventory system kalian.

![image](https://github.com/user-attachments/assets/308c135d-40e6-44d8-8cd5-303531ab04bb)

setelah di klik repo kalian, otomatis railway akan menjalankan build project 
di case project kita, railway akan menjalankan createNodejsApp.js 

![image](https://github.com/user-attachments/assets/3aa47d06-55a2-472f-bc10-bfbc7bde968f)

![image](https://github.com/user-attachments/assets/dcbc42fd-a43b-447f-86d2-cbfbfbe375ed)


Sebelum itu, apps kalian sudah pasti error. karena kita belum set up env pada cloud service railway. (ENV hal yang wajib di set up selama kalian deploy).

buka tab variables dan isi semua env variables kalian :

![image](https://github.com/user-attachments/assets/4c895e93-b953-4bc8-8765-75a0f6992052)

setelah diisi maka hasilnya kayak gini :

![image](https://github.com/user-attachments/assets/62053091-eaa8-4935-ac63-b7e54725940e)


Karena cloud serivice kita sudah ada fitur CI/CD, otomatis server akan build ulang atau deploy ulang apps kita. 

![image](https://github.com/user-attachments/assets/1ba46172-0946-450c-b543-b28cae03bbf5)

Setelah Build selesai, kalian check Settings tab -> Networking.
klik generate domain, untuk membuka domain pada backend kalian.

***Deploy Done***
Deploy selesai, sekarang apps kalian sudah live di internet.

https://inventory-system-production-4570.up.railway.app/


**NOTE:** 
Jika railway kalian trialnya habis, gua saranin dari sekarang kalian sudah mulai memikirkan server/cloud service buat nemenin masa pembelajaran kalian. Karena di pembelajaran selanjutnya kalian akan lebih sering deploy backend untuk kebutuhan phase 2. kalian bisa beli plan nya railway kayak gua (hobby plan). overall plan ini kalo servernya ga banyak cuman ke charge 50 ribuan per bulan 

![image](https://github.com/user-attachments/assets/eb687f04-150c-422d-bc15-8f66ec29df57)


atau kalian bisa beli cloud service umum seperti AWS, GCP , atau Azure. cuman kalian perlu belajar linux untuk deploy apps kalian, karena mereka basenya remote ke VPS (ga UI seperti railway). jadi kalian perlu belajar learning path untuk cloud service itu sendiri
