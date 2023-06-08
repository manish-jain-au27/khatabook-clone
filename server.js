const express = require('express');
const mongoose = require('mongoose');
const app = express();
const initdb = require("./initdb");
const dotenv = require('dotenv');
const ledgerRoutes = require('./routes/ledger');


require("dotenv").config();
initdb();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'hbs');



app.use('/ledger', ledgerRoutes);



app.listen(8000,()=>{
    console.log("server listening on port 8000")
})