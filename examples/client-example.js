const CoconutDBClient = require('../coconutdb-client');

(async () => {
    const db = new CoconutDBClient('http://localhost:27018');
    const users = db.collection('users');

    await users.insertOne({ name: 'Jehan', role: 'admin' });
    const found = await users.find({ name: 'Jehan' });
    console.log('Found:', found);

    await users.updateOne({ name: 'Jehan' }, { role: 'super-admin' });

    await users.deleteOne({ name: 'Jehan' });

    console.log('✅ Done!');
})();
