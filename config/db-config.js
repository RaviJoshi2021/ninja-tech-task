const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to database successfully");
}).catch(err => {
    console.log("Error occuer while connecting to database");
    process.exit();
});
// module.exports = connect;