const fs = require('fs');
const _ = require('lodash');
const { jsonSongsDir } = require('../config');

function getById(id) {
    const formattedId = padId(id);
    const file = fs.readFileSync(`${jsonSongsDir}${formattedId}.json`);

    return JSON.parse(file.toString());
}

function nameToId(name) {
    const id = name.split(' ')[0];
    return padId(id);
}

function padId(id) {
    return _.padStart(id, 3, 0);
}

module.exports = { getById, nameToId }