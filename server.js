const mongoose = require('mongoose');
const app = require('./app');

//enveroment global
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

//capture errors
process.on('uncaughtException', err =>{
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION :( shutting down...");
    console.log(err.name, err.message);
});
const DB = process.env.DB_MONGO
.replace('<user>', process.env.USER)
.replace('<password>', process.env.PASSWORD );
//connect database
mongoose.connect(DB, 
{
    useNewUrlParser: true,
    useUnifiedTopology: true
    // useCreateIndex: true,
   // useFindAndModify: false
    
}).then(()=> console.log('db connect success') );

//connect server
const port = process.env.PORT || '5000';
const server = app.listen(port, ()=>{
    console.log(`server connect success in port:${port}`);
    console.log(`mode: ${process.env.NODE_ENV}`);
});
//capture errors
process.on('unhandledRejection', err =>{
    console.log('UNHANDLE REJECTION :( shutting down...');
    console.log(err.name, err.message);
    server.close(()=>{
        process.exit(1);
    });
});