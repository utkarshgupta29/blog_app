var bodyParser   =  require('body-parser'),
    express      =  require('express');

const dotenv = require('dotenv');
const path = require('path');
// var seedDB = require("./seed");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('./dbcontext');
    
var app = express();
var methodOverride = require('method-override');

var expressSanitizer = require("express-sanitizer");
var blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body : String,
    created : {type : Date, default: Date.now}
});
var Blog = mongoose.model('Blog',blogSchema);

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

app.get('/',function(req,res){
    res.redirect("/blogs");
});
//INDEX
app.get('/blogs',function(req,res){
    Blog.find({},function(err,blogs){
        if(err)
            console.log(err);
        else{
            res.render('index',{blogs:blogs});
        }
    })

});
//NEW
app.get('/blogs/new',function(req,res){
    res.render('new');
});
//CREATE
app.post('/blogs',function(req,res){
    var newBlog = req.body.blog;
    newBlog.body=req.sanitize(newBlog.body);
    Blog.create(newBlog,function(err,newBlog){
        if(err)
            console.log(err);
        else
            res.redirect('/blogs');
    })
});
app.get('/blogs/:id',function(req,res){
    Blog.findById(req.params.id,function(err,blog){
        if(err)
            console.log(err);
        else
            res.render('show',{blog:blog});

    });
});
//EDIT ROUTE
app.get('/blogs/:id/edit',function(req,res){
    Blog.findById(req.params.id,function(err,blog){
        if(err)
            console.log(err);
        else
            res.render('edit',{blog:blog});
    }); 
});
//UPDATE ROUTE
app.put('/blogs/:id',function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,blog){
        if(err)
            console.log(err);
        else{
            res.redirect('/blogs/'+req.params.id);
        }
    });

})
//DELETE Route
app.delete('/blogs/:id',function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err,data){
        if(err)
            console.log("blog not deleted" +err);
        else{
            console.log("Blog deleted"+data);
            res.redirect('/blogs');
        }
    })
});
app.listen(process.env.PORT||5000,function(){
    console.log("server is running.");
});