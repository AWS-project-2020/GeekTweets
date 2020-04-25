
var mongodb=require('./db');

//Constructeur
function User(user){
    this.name=user.name;
    this.password=user.password;
}

module.exports=User;

User.prototype.save=function save(callback){
    var user={
        name:this.name,
        password:this.password
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err); //Erreur d'ouverture, il n'est donc pas nécessaire d'appeler manuellement mongodb.close ()
        }
        //Lire la collection d'utilisateurs
        db.collection('users',function(err,collection){
           if(err){
               mongodb.close();
               return callback(err);
           }
            //Ajouter un index unique pour l'attribut de nom
            collection.ensureIndex('name',{unique:true});
            //Rédiger un document utilisateur
            collection.insert(user,{safe:true},function(err,user){
                mongodb.close();
                callback(err,user);
            });
        });
    })
}

//Demander si un utilisateur existe déjà dans la base de données
User.get=function get(username,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({name:username},function(err,doc){
                mongodb.close();
                if(doc){
                    var user=new User(doc);
                    callback(err,user);
                }else{
                    callback(err,null);
                }
            })
        });
    })
}
