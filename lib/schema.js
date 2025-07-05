const CoconutDB = require('coconutdb');

class CoconutSchema {
    constructor(definition, options = {}) {
        this.definition = definition;
        this.options = options;
    }
}

class CoconutModel {
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
        this.collection = new CoconutDB('./data').collection(name);
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

    async insertOne(doc) {
        const errors = await this.validate(doc);
        if (errors.length) throw new Error(`Validation failed: ${errors.join(', ')}`);
        doc = this.applyDefaults(doc);
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

module.exports = { CoconutSchema, CoconutModel };
