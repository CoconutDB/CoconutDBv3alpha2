const fs = require('fs').promises;
const path = require('path');

class CoconutCollection {
    constructor(name, basePath) {
        this.name = name;
        this.file = path.join(basePath, `${name}.json`);
    }

    async _read() {
        try {
            const data = await fs.readFile(this.file, 'utf8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    async _write(data) {
        await fs.writeFile(this.file, JSON.stringify(data, null, 2));
    }

    async find(query = {}) {
        const docs = await this._read();
        return docs.filter(doc =>
            Object.entries(query).every(([k, v]) => doc[k] === v)
        );
    }

    async insertOne(doc) {
        const docs = await this._read();
        docs.push(doc);
        await this._write(docs);
        return doc;
    }

    async updateOne(query, update) {
        const docs = await this._read();
        let updated = false;
        for (let doc of docs) {
            if (Object.entries(query).every(([k, v]) => doc[k] === v)) {
                Object.assign(doc, update);
                updated = true;
                break;
            }
        }
        await this._write(docs);
        return updated;
    }

    async deleteOne(query) {
        let docs = await this._read();
        const initialLength = docs.length;
        docs = docs.filter(doc => !Object.entries(query).every(([k, v]) => doc[k] === v));
        await this._write(docs);
        return initialLength !== docs.length;
    }
}

class CoconutDB {
    constructor(basePath) {
        this.basePath = basePath;
    }

    collection(name) {
        return new CoconutCollection(name, this.basePath);
    }
}

module.exports = CoconutDB;
