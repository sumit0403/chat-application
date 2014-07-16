var mongo = require("mongodb").MongoClient,
	client =require("socket.io").listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chatapp',function(err, db){
	if(err){
		console.log("error in connecting database");
		throw err;
	} 
	var collection = db.collection('messages');

	client.on('connection', function(socket){
		
		var senddata = function(s){
			socket.emit('status', s);
		}
		
		collection.find().limit(100).sort({_id:1}).toArray(function(err, res){
			if(err) throw err;
			socket.emit('output', res);
			console.log("sending the result");
		});
		
		socket.on('input', function(data){
			
			var nameOfClient = data.name;
			var messageOfClient = data.message;
			var emptyPattern = /^\s*$/;
			
			if(emptyPattern.test(nameOfClient) || emptyPattern.test(messageOfClient)){
				senddata("Please fill your name and message");
			}else{
				collection.insert({name: nameOfClient, message:messageOfClient}, function(){
					
					client.emit('output', [data]);
					senddata({message: "message sent", makeclear: true});
				});
			}
			
			
		});
	});
});

