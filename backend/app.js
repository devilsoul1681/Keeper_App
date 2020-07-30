const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const cors = require('cors'); // addition we make
const fileUpload = require('express-fileupload'); //addition we make
var validator = require("email-validator");//useless
const bcrypt=require("bcrypt"); //this is for hashing of password
const saltRounds=10;
const https=require("https");




const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json()); //addition we make
app.use(cors());
app.use(fileUpload());

mongoose.connect("mongodb://localhost:27017/personDB",{ useNewUrlParser: true ,useUnifiedTopology: true, useFindAndModify: false  });

const personSchema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    content:Array
});

const Person= new mongoose.model("person",personSchema);

var wrongpassword={
    email:"1111"
};

var usernotfound={
    email:"111"
};

var useralexist={
    email:"11"
};

var newuserc={
    email:"1"
};

var wrongemail={
    email:"01"
}


app.get("/:email",function(rq,rs){
    rs.send(usernotfound);
})

app.get('/:email/:password',function(rq,rs){
    var email=rq.params.email;
    var password=rq.params.password;
    var s=0
    Person.find(function(err,data){
        if(err){
            console.log(err)
        }
        else{
          for(var i=0;i<data.length;i++){
              if(data[i].email===email){
                  s=s+1;
                  bcrypt.compare(password,data[i].password, function(err, result) {
                    if(result===true){
                        rs.send(data[i])
                    }
                    else{
                        rs.send(wrongpassword)
                    }
                });
                  break;
              }
          }
          if(s===0){
          rs.send(usernotfound);
          }
        }
    })
})

app.post('/',function(rq,rs){
    var s=0;
    Person.find(function(err,data){
        if(!err){
            for(var i=0;i<data.length;i++){
                if(data[i].email===rq.body.email){
                    s=s+1;
                    rs.send(useralexist)
                    break;
                }
            }
            if(s===0){
                 url="https://apilayer.net/api/check?access_key=dff0295c2565d143b155d3859abe1a12&email="+rq.body.email;
                 https.get(url,function(response){
                     response.on("data",function(data){
                         const information=JSON.parse(data);
                         if(information.free===true){
                            bcrypt.hash(rq.body.password, saltRounds, function(err, hash) {
                                const person= new Person({
                                    name:rq.body.name,
                                    email:rq.body.email,
                                    password:hash,
                                    content:[]
                                });
                                person.save()
                                rs.send(person);   
                            });
                    }
                    else{
                        rs.send(wrongemail)
                    }                         
                         
                     })
                 })
        }
    }})

});



app.post("/update/:email",function(rq,rs){
    Person.updateOne({email:rq.params.email},{content:rq.body},function(err){
        if(!err){
        }
    })
    
});


app.listen(5000,function(){
    console.log("server is running on port 5000");
})



//api_key=dff0295c2565d143b155d3859abe1a12