
var mongodb=require('./db');

//Constructeur
function Post(username,post,time){
    this.user=username;
    this.post=post;
    if(time){
        this.time=time;
    }else {
        this.time = new Date();
    }
}

module.exports=Post;

Post.prototype.save=function save(callback){
    var post={
        user:this.user,
        post:this.post,
        time:this.time
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err); //Erreur d'ouverture, il n'est donc pas nécessaire d'appeler manuellement mongodb.close ()
        }
        //Lire la collection d'articles
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //Ajouter un index pour l'attribut utilisateur
            collection.ensureIndex('user',{unique:true});
            //Rédiger un document de publication
            collection.insert(post,{safe:true},function(err,post){
                mongodb.close();
                callback(err,post);
            });
        });
    })
}

//Renvoyer le tableau de publication correspondant par nom d'utilisateur
Post.get=function get(username,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //Recherchez tous les documents de la collection de publications dont la valeur d'attribut utilisateur est nom d'utilisateur, si le nom d'utilisateur est nul, renvoyez tout
            var query={};
            if(username){
                query={user:username};
            }
            //Les résultats des requêtes sont triés par ordre décroissant de temps
            collection.find(query).sort({time:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    callback(err,null);
                }
                var posts=[];
                docs.forEach(function(doc,index){
                    if(doc){
                       var post=new Post(doc.user,doc.post,doc.time);
                        posts.push(post);
                    }
                })
               callback(err,posts);
            });
        });
    })
}
