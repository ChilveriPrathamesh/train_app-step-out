const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const userRoutes = require('./routes/user')

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api',userRoutes)


 app.get('/' , (req,res)=>{
    res.send('Welcome to the Train Booking App API');
 })

const PORT = process.env.PORT || 4800;

app.listen(PORT , ()=>{
    console.log(`serever is running at port ${PORT}`)
})