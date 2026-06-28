const express=require("express");
const app=express();
const users=require("./routes/user.js");
const posts=require("./routes/posts.js");
const session=require("express-session");
const flash=require("connect-flash");
const path=require("path");



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const  sessionOptions={
    secret:"myscretttttttstring",
    resave:false,
    saveUninitialixed:true,
};
app.use(session(sessionOptions));
app.use(flash());

app.get("/register",(req,res)=>{
    let {name="anonymous"}= req.query;
    req.session.name = name;
    req.flash("success","user registered successfully") ;
    res.redirect("/hello")

});
app.get("/hello",(req,res)=>{
    console.log(req.flash())
    res.render("page.ejs",{name:req.session.name,msg:req.flash("success")});
});





// app.get("/reqcount",(req,res)=>{
//     if(req.session.count){
//         req.session.count++;
// }else{
//     req.session.count=1;
//     }
//     res.send(`you sent a req ${req.session.count} times`);
// });

// app.use(session({secret:"myscretttttttstring"}));
// app.get("/test",(req,res)=>{
//     res.send("test successful")
// });



app.listen(3000,()=>{
    console.log("app is listening to port");
});

