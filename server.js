


const express=require('express');
const fs=require('fs');
const path=require('path');
const bcrypt=require('bcrypt');
const app=express();
app.use(express.json());

const DB_PATH=path.join(__dirname,'db.json');
const readDB=()=>JSON.parse(fs.readFileSync(DB_PATH,'utf-8'));
const writeDB=(data)=>fs.writeFileSync(DB_PATH,JSON.stringify(data,null,2));

app.post('/signUp',async (req,res)=>{
    const {email,password}=req.body;
    const db=readDB();
    const userExists=db.users.find(user=>user.email===email);
    if(userExists){
        return res.status(400).json({message:"User already exists"});
    }
    const hashPassword=await bcrypt.hash(password,10); // 10 is called salt rounds i.e., how many times the data is processed
    db.users.push({email,password: hashPassword});
    writeDB(db);
    res.status(201).json({message:"User registered successfully"});
    console.log(db.users);
});

app.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    const db=readDB();
    const user=db.users.find(user=>user.email===email);
    if(!user){
        return res.status(400).json({message:"Invalid email or password"});
    }
    const isPasswordValid=await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(400).json({message:"Invalid email or password"});
    }
    console.log("Login successful", db.users);
    res.status(200).json({message:"Login successful"});
});

app.get('/reset',(req,res)=>{
    writeDB({users:[]});
    res.send("Database reset successful");
});

app.listen(7000,()=>{
    console.log("Server is running on port 7000");
});