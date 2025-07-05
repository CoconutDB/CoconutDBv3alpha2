const fetch = require('node-fetch');

class CoconutCollectionClient {
    constructor(baseURL, name) {
        this.baseURL = baseURL;
        this.name = name;
    }

    async find(query = {}) {
        const res = await fetch(`${this.baseURL}/${this.name}/find`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        return data.result;
    }

    async insertOne(doc) {
        const res = await fetch(`${this.baseURL}/${this.name}/insertOne`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doc })
        });
        const data = await res.json();
        return data.doc;
    }

    async updateOne(query, update) {
        const res = await fetch(`${this.baseURL}/${this.name}/updateOne`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, update })
        });
        const data = await res.json();
        return data.result;
    }

    async deleteOne(query) {
        const res = await fetch(`${this.baseURL}/${this.name}/deleteOne`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        return data.result;
    }
}

class CoconutDBClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    collection(name) {
        return new CoconutCollectionClient(this.baseURL, name);
    }
}

module.exports = CoconutDBClient;
