const fs = require('fs');
const fse = require('fs-extra');
const x2j = require('xml2js');
const _ = require('lodash');
const { nameToId } = require('../services/songs');
const { xmlSongsDir, jsonSongsDir, backupDir } = require('../config.json');

async function generate() {
    const from = xmlSongsDir;
    const to = jsonSongsDir;
    if (!fs.existsSync(xmlSongsDir)) { fs.mkdirSync(xmlSongsDir); }
    const xmlFileNames = fs.readdirSync(xmlSongsDir);
    if (!fs.existsSync(jsonSongsDir)) { fs.mkdirSync(jsonSongsDir); }
    const jsonFileNames = fs.readdirSync(jsonSongsDir);

    const jsonFileNamesTrimed = jsonFileNames.map(fileName => fileName.replace('.json', ''));

    const generateNeeded = xmlFileNames.filter(fileName => !jsonFileNamesTrimed.includes(nameToId(fileName)));

    if (!generateNeeded.length) {
        return console.log('No generating needed');
    }

    const backupName = `${getDateString()}-jsonSongs`;
    await backupJsons(to, `${backupDir}${backupName}`);
    console.log(`Backup finished to ${backupName}`);

    console.log(`Generating new files [${generateNeeded.length}]`)
    generateNeeded.forEach(async fileName => await convertSong(fileName, from, to))
}

async function backupJsons(from, to) {
    return await fse.copy(from, to);
}

async function convertSong(fileName, from = './resources/xmlSongs/', to = './resources/jsonSongs/') {
    const file = fs.readFileSync(`${from}${fileName}`);
    const xml = file.toString();
    const json = await x2j.parseStringPromise(xml);

    const { lyrics, hymn_number, title, presentation } = json.song;

    const presentationParsed = _.compact(presentation[0].split(' '));

    const names = lyrics[0].match(/\[\w+\]/g);
    const namesTrimmed = names.map(a => a.replace(/\[|\]/g, ''));
    const rawValues = lyrics[0].split(/\[\w+\]/g);
    rawValues.shift();
    let values = rawValues.map(a => a.replace(/\r\n \r\n/g, '\r\n'));
    values = rawValues.map(a => a.replace(/\n \n/g, '\n'));

    const lyricsMapped = {}
    if (namesTrimmed.length !== values.length) {
        throw new Error(`${fileName} - Parsed count of keys and values does differs. keys ${namesTrimmed.length} != values ${values.length}`);
    };

    for (let i = 0; i < namesTrimmed.length; i += 1) {
        lyricsMapped[namesTrimmed[i]] = values[i];
    }

    if (presentationParsed.length && _.difference(presentationParsed, namesTrimmed).length) {
        throw new Error(`${fileName} - Lyrics order has not defined tags. Order: ${presentationParsed} | Defined: ${namesTrimmed}`);
    }

    const result = {
        title: title[0],
        number: hymn_number[0],
        presentation: presentationParsed,
        lyrics: lyricsMapped
    }

    const id = nameToId(fileName)
    fs.writeFileSync(`${to}${id}.json`, JSON.stringify(result));

    return;
}

function getDateString() {
    const today = new Date();
    const time = String(today.getTime());
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    return `${yyyy}-${mm}-${dd}-${time}`;
}

generate().then( result => {
    console.log('Finished');
})