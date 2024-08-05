const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const db = require('../config/db')

router.post('signup' ,async (req , res)=>{
    const {username , email , password} = req.body

    try{
        const [user] = await db.promise().query('SELECT * FROM user WHERE email = ?',[email]);
        if (user.length >0){
            return res.status(400).json({message:'User Already exists:'})
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password , 10);

        await db.promise.query('INSERT INTO users (username , email , password) VALUES (?,?,?)',[
            username ,
            email,
            hashedPassword
        ]);
        res.status(201).json({message : 'User registered successfully'})
    }catch (error){
        console.error(error);
        res.status(500).json({message : 'Server Error'});
    }
});

module.exports = router
