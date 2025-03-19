import dotenv from 'dotenv';
dotenv.config();

import connectDb from './db/db';
import app from './app';

const MONGO_URI = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 5000;


connectDb(MONGO_URI)
  .then(()=> {
    app.listen(PORT,()=> {
      console.log(`server listening on PORT: ${5000}`)
    })
  })


console.log(PORT);

