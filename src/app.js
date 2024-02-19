//should be on top always
require('dotenv').config();
//should be on top always
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
require('./db/conn');
const Employee = require('./models/emp')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 8080;


const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialPath = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(staticPath));
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialPath);

// app.use(EmpRouter);
console.log(process.env.SECRET_KEY)


app.get("/", (req, res) => {
    res.render("index")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register", async (req, res) => {
    try{
        const password = req.body.password;
        const cpassword = req.body.cpassword;


        if(password === cpassword){
            const registerEmp = await new Employee({
                firstName:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phoneNumber: req.body.phno,
                age:req.body.age,
                password:password,
                confirmpassword:cpassword
            })

            const token = await registerEmp.generateAuthToken();

            const registered = await registerEmp.save();
            res.status(201).render('index');

        }else{
            res.send("Passwords are not matching.")
        }
    }catch(e){
        res.status(400).send(e);
        console.log("pswd err.")
    }
})

app.get("/signin", (req, res) => {
    res.render("login");
})

app.post("/signin", async(req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Employee.findOne({email:email});

        const pwdCheck = await bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken();
        console.log(token);


        if(pwdCheck){
            res.status(201).render("index");
        }else{
            res.send("invalid credentials.");
        }

    }catch(err){
        res.status(400).send("invalid credentials.");
    }
})

app.listen(port, () => {
    console.log(`listening to the port ${8080}`);
})