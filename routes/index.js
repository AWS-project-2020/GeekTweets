var express = require('express');
var router = express.Router();
var crypto=require('crypto');
var User=require('../models/user.js');
var Post=require('../models/post.js');
//index
router.get('/', function(req, res, next) {
    
    Post.get(null,function(err,posts){
        if(err){
            posts=[];
        }
        res.render('index',{title:'index',posts:posts});
    });
});


//page de utilisateur
router.get('/u/:user', function(req, res, next) {
User.get(req.params.user,function(err,user){
if(!user){
    req.flash('error','L\'utilisateur n\'existe pas');
    res.redirect('/');
}else{
    Post.get(user.name,function(err,posts){
        if(err){
            req.flash('error',err);
            res.redirect('/');
        }else{
            res.render('user',{title:user.name,posts:posts});
        }
    })
}
});
});

router.post('/post',checkLogin);
//Page de commentaire
router.post('/post', function(req, res, next) {
    var currentUser=req.session.user;
    var post=new Post(currentUser.name,req.body.post);
    post.save(function(err){
        if(err){
            req.flash('error',err);
            res.redirect('/');
        }else{
            req.flash('success','Publié avec succès');
            res.redirect('/u/'+currentUser.name);
        }
    });
});


router.get('/reg',checkNotLogin);
//Page d'inscription
router.get('/reg', function(req, res, next) {
    res.render('reg',{title:'Inscription des utilisateurs'});
});

router.post('/reg',checkNotLogin);
router.post('/reg', function(req, res, next) {
    //Vérifiez si le mot de passe entré deux fois par l'utilisateur est le même
    if(req.body['password-repeat']!=req.body['password']){
        console.log("jkjkj");
        req.flash('error','Les mots de passe ne sont pas similaires');
        return res.redirect('/reg');
    }

    //Générez la valeur de hachage du mot de passe
    var md5=crypto.createHash('md5');
    var password=md5.update(req.body.password).digest('base64');

    var newUser=new User({
        name:req.body.username,
        password:password
    });

    //Vérifiez si le nom d'utilisateur existe déjà
    User.get(newUser.name,function(err,user){
        //Si ce nom d'utilisateur existe déjà, revenez en arrière et demandez
        if(user)
            err='Username already exists.';
        if(err){
            req.flash('error',err);
            return res.redirect('/reg');
        }
        //Ajouter un utilisateur s'il n'existe pas
        newUser.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            req.session.user=newUser;
            req.flash('success','Inscription réussie');
            res.redirect('/');
        });
    })
});

router.get('/login',checkNotLogin);
//page de login
router.get('/login', function(req, res, next) {
    res.render('login',{title:'Connexion utilisateur'});
});
router.post('/login',checkNotLogin);
router.post('/login', function(req, res, next) {
    //Générez la valeur de hachage du mot de passe
    var md5=crypto.createHash('md5');
    var password=md5.update(req.body.password).digest('base64');
    var username=req.body.username;
    User.get(username,function(err,user){
        if(!user){
            req.flash('error','Ce nom d\'utilisateur n\'existe pas');
            return res.redirect('/login');
        }else{
            if(user.password===password){
                req.flash('success','Connexion réussie');
                req.session.user=user;
                return res.redirect('/');
            }else{
                req.flash('error','Mot de passe incorrect');
                return res.redirect('/login');
            }
        }
    });
});

router.get('/logout',checkLogin);
//Page de déconnexion
router.get('/logout', function(req, res, next) {
    req.session.user=null;
    req.flash('error','Déconnexion réussie');
    res.redirect('/');
});
module.exports = router;

//Confirmez que vous n'êtes pas connecté, vous ne pouvez pas vous connecter et vous inscrire
function checkNotLogin(req,res,next){
    if(req.session.user){
        req.flash('error','Connecté');
        res.redirect('/');
    }else{
        next();
    }
}

//Confirmez que vous êtes connecté, vous ne pouvez pas vous déconnecter sans vous connecter et accédez à la page de connexion
function checkLogin(req,res,next){
    if(req.session.user){
        next();
    }else{
        req.flash('error','Non connecté');
        res.redirect('/login');
    }
}

