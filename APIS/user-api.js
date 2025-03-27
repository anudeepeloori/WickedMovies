const exp=require('express')
const { ObjectId } = require('mongodb');
const userApi=exp.Router();
const errorhandler= require("express-async-handler")
const bcryptjs=require("bcryptjs")
const jwt =require("jsonwebtoken")
require("dotenv").config()

//body parser middleware
userApi.use(exp.json())


//getuser
userApi.get('/getusers',errorhandler(async(req,res)=>{
    let userCollectionObj = req.app.get("userCollectionObj")
    let userlist= await userCollectionObj.find().toArray()
    res.send({message:userlist})
}))

//get user by username 
userApi.get('/getuser/:username',errorhandler(async(req,res)=>{
    let userCollectionObj = req.app.get("userCollectionObj")
    let un=req.params.username
    let userobj = await userCollectionObj.findOne({username:un})
    if(userobj===null){
        res.send("no user existed with username" )
    }
    else{
        res.send({message:userobj})
    }
}))


//creating a new user
userApi.post("/createuser",errorhandler(async(req,res)=>{
    let userCollectionObj = req.app.get("userCollectionObj")
    newuser=req.body;
    let user= await userCollectionObj.findOne({username:newuser.username})
    if(user===null){
        //hash password
        let hashedpassword=await bcryptjs.hash(newuser.password,7)
        //replace password
        newuser.password=hashedpassword
        //insert
       await userCollectionObj.insertOne(newuser)
        res.send({message:"Registration successful"})
    }
    else{
        res.send({message:"user already existed, please try different username"})
    }
}))


//login 
userApi.post("/login",errorhandler(async(req,res)=>{
    let userCollectionObj = req.app.get("userCollectionObj")
    let credentials=req.body;
    let user = await userCollectionObj.findOne({username:credentials.username})
    if(user===null){
        res.send({message:"please Register to Login"})
    }
    else{
       let result=await bcryptjs.compare(credentials.password,user.password)
       if(result===false){
           res.send({message:"invalid password"})
       }
       else{
           //create a token 
           let signedtoken=jwt.sign({username:credentials.username},'abcdef',{expiresIn:120})
           //send token to client
           res.send({message:'login success',token:signedtoken,username:credentials.username,userObj: user})
       }
    }
}))

//contact us
userApi.post("/contactform", errorhandler(async(req,res)=>{
    let contactscollection = req.app.get("contactscollection")
    query=req.body;
    await contactscollection.insertOne(query)
    res.send({message:"your query successfully submitted"})
}))

//post App ratings
userApi.post("/apprating",errorhandler(async(req,res)=>{
    let ratingcollectionObj=req.app.get("ratingcollection")
    const rating=req.body;
    let userRating=await ratingcollectionObj.findOne({username:rating.username})
    if(userRating===null){
        await ratingcollectionObj.insertOne(rating)
        res.send({message:"rating is successfull"})
    }
    else{
        await ratingcollectionObj.updateOne(
            { username: rating.username }, 
            { $set: { rating: rating.rating, updatedAt: new Date() } }
        );
        res.send({ message: "Your rating was updated" });
    }
    
}))

//get App ratings
userApi.get("/getappratings",errorhandler(async(req,res)=>{
    let ratingcollectionobj = req.app.get("ratingcollection")
    let ratinglist= await ratingcollectionobj.find().toArray()
    res.send({message:ratinglist})
}))


//post movie ratings
userApi.post("/submitreview", errorhandler(async (req, res) => {
    let reviewCollection = req.app.get("reviewCollection"); 

    const { username, movieId, reviewText, rating } = req.body;

    if (!username || !movieId) {
        return res.send({ message: "Username and movieId are required." });
    }

    const existingReview = await reviewCollection.findOne({
        username: username,
        movieId: movieId, 
    });

    if (existingReview) {
        await reviewCollection.updateOne(
            { username: username, movieId: movieId },
            { $set: { reviewText, rating, updatedAt: new Date() } }
        );
        return res.send({ message: "Review updated successfully." });
    }

    const result = await reviewCollection.insertOne({
        username,
        movieId,
        reviewText,
        rating,
        createdAt: new Date()
    });

    res.send({ message: "Review submitted successfully.", reviewId: result.insertedId });
}));



//get movie ratings
userApi.get("/getmoviereview/:username/:movieId", errorhandler(async (req, res) => {
    let reviewCollection = req.app.get("reviewCollection");

    const { username, movieId } = req.params;

    if (!username || !movieId) {
        return res.send({ message: "Invalid username or movieId." });
    }

    const review = await reviewCollection.findOne({
        username: username,
        movieId: Number(movieId), 
    });

    if (review) {
        res.send(review);
    } else {
        res.send({ message: "No review found." });
    }
}));


// Get average rating of a movie
userApi.get("/getaveragerating/:movieId", errorhandler(async (req, res) => {
    let reviewCollection = req.app.get("reviewCollection");
    const { movieId } = req.params;
    // console.log("Fetching average rating for movieId:", movieId); // 
    const result = await reviewCollection.aggregate([
        { $match: { movieId: Number(movieId) } },
        { $group: { _id: "$movieId", avgRating: { $avg: "$rating" } } }
    ]).toArray();
    // console.log("Aggregation result:", result); // 
    if (result.length > 0) {
        res.send({ avgRating: result[0].avgRating.toFixed(1) });
    } else {
        res.send({ avgRating: 0 });
    }
}));

// Get all reviews for a movie
userApi.get("/getallreviews/:movieId", errorhandler(async (req, res) => {
    let reviewCollection = req.app.get("reviewCollection");
    const { movieId } = req.params;

    const reviews = await reviewCollection.find({ movieId: Number(movieId)}).toArray();
    res.send(reviews);
}));


//Forgot password code below
const nodemailer = require("nodemailer");

// Temporary OTP storage (In real app, store in DB with expiry)
const otpStorage = {};

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Set this in .env
        pass: process.env.EMAIL_PASS,  // Set this in .env
    },
});

// Send OTP
userApi.post("/forgot-password", errorhandler(async (req, res) => {
    const { email } = req.body;
    let userCollectionObj = req.app.get("userCollectionObj");

    // Check if user exists
    const user = await userCollectionObj.findOne({ email });
    if (!user) {
        return res.send({ message: "User not found!" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    otpStorage[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // Expire in 10 mins

    // Email Content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Wicked Movies Account Password Reset",
        text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    res.send({ message: "OTP sent to your email!" });
}));


userApi.post("/verify-otp", errorhandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!otpStorage[email]) {
        return res.send({ message: "OTP expired or invalid!" });
    }

    if (otpStorage[email].otp != otp) {
        return res.send({ message: "Invalid OTP!" });
    }

    res.send({ message: "OTP verified successfully!" });
}));



userApi.post("/reset-password", errorhandler(async (req, res) => {
    const { email, newPassword } = req.body;
    let userCollectionObj = req.app.get("userCollectionObj");

    //Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    //Update password in DB
    await userCollectionObj.updateOne({ email }, { $set: { password: hashedPassword } });

    //Remove OTP
    delete otpStorage[email];

    res.send({ message: "Password reset successful! You can now login." });
}));




module.exports=userApi