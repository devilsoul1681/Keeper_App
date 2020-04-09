const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const cors = require('cors'); // addition we make
const fileUpload = require('express-fileupload'); //addition we make

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
                  if(data[i].password===password){
                  rs.send(data[i])
                  }else{
                      rs.send(wrongpassword)
                  }
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
                const person= new Person({
                    name:rq.body.name,
                    email:rq.body.email,
                    password:rq.body.password,
                    content:[]
                });
                person.save()
                console.log("hello")
                rs.send(person);
            }
        }
    })

});



app.post("/update/:email",function(rq,rs){
    console.log(rq.body)
    console.log(rq.params.email)
    Person.updateOne({email:rq.params.email},{content:rq.body},function(err){
        if(!err){
            console.log("Successfully updated")
        }
    })
    
});


app.listen(5000,function(){
    console.log("server is running on port 5000");
})