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
        docs = docs.filter(doc =>
            !Object.entries(query).every(([k, v]) => doc[k] === v)
        );
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

class CoconutSchema {
    constructor(definition, options = {}) {
        this.definition = definition;
        this.options = options;
    }
}

class CoconutModel {
    constructor(name, schema, basePath = './data') {
        this.name = name;
        this.schema = schema;
        this.collection = new CoconutDB(basePath).collection(name);
    }

    async validate(doc) {
        const errors = [];
        for (const [field, rules] of Object.entries(this.schema.definition)) {
            const value = doc[field];

            if (rules.required && (value === undefined || value === null)) {
                errors.push(`${field} is required`);
            }

            if (rules.type && value !== undefined) {
                switch (rules.type) {
                    case String:
                        if (typeof value !== 'string') errors.push(`${field} must be a string`);
                        break;
                    case Boolean:
                        if (typeof value !== 'boolean') errors.push(`${field} must be a boolean`);
                        break;
                    case Number:
                        if (typeof value !== 'number') errors.push(`${field} must be a number`);
                        break;
                    case Array:
                        if (!Array.isArray(value)) errors.push(`${field} must be an array`);
                        break;
                    default:
                        break;
                }
            }
        }
        return errors;
    }

    applyDefaults(doc) {
        for (const [field, rules] of Object.entries(this.schema.definition)) {
            if (doc[field] === undefined && rules.default !== undefined) {
                doc[field] = typeof rules.default === 'function' ? rules.default() : rules.default;
            }
        }
        if (this.schema.options.timestamps) {
            const now = new Date().toISOString();
            doc.createdAt = doc.createdAt || now;
            doc.updatedAt = now;
        }
        return doc;
    }

    async checkUnique(doc) {
        for (const [field, rules] of Object.entries(this.schema.definition)) {
            if (rules.unique && doc[field]) {
                const existing = await this.find({ [field]: doc[field] });
                if (existing.length > 0) {
                    throw new Error(`${field} must be unique`);
                }
            }
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    async insertOne(doc) {
        const errors = await this.validate(doc);
        if (errors.length) throw new Error(`Validation failed: ${errors.join(', ')}`);
        await this.checkUnique(doc);
        doc = this.applyDefaults(doc);
        doc._id = this.generateId();
        return await this.collection.insertOne(doc);
    }

    async find(query = {}) {
        return await this.collection.find(query);
    }

    async updateOne(query, update) {
        if (this.schema.options.timestamps) {
            update.updatedAt = new Date().toISOString();
        }
        return await this.collection.updateOne(query, update);
    }

    async deleteOne(query) {
        return await this.collection.deleteOne(query);
    }
}

module.exports = { CoconutDB, CoconutSchema, CoconutModel };
