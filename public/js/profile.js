
		var peer = new Peer({ key: 'lwjd5qra8257b9', debug: 3});
		//var peer = new Peer({ key: 'lwjd5qra8257b9', debug: 3});
 		var friendlist ={};
		//connect to the port 8080
  		var socket = io.connect('http://localhost:8080');
		//sends the first name of the user that has to searched
  		socket.on('connect', function(){
			<% for(var i=0; i<friendss.length; i++) { %>
				$('#pending-requests').append('<div id="add_friend">'+"<%= friendss[i] %>"+' has requested you to add.            <a href="/profile1" onclick="add_request(\''+ "<%= friendss[i] %>" +'\',\''+ "<%= user._id %>" +'\',\''+ "<%= user.user.firstname %>" +'\')">Add</a>                     <a href="#" onclick="delete_request(\''+ "<%= friendss[i] %>" +'\')">Cancel</a></div><br>');			
			<% } %>
			socket.emit('adduserr', "<%= user.user.firstname %>","<%= user._id %>");
			//stores the value of friends list of the corresponding user into the hash friendlist
			<% for(var i=0; i<friends.length; i++) { %>
				var str ="<%= friends[i] %>"
				friendlist[str] = str
			<% } %>
  		});

		function add_request(friendname,userid, username){
			socket.emit('add new friend', friendname, userid, username);
			$('#add_friend').fadeOut(800);	
		}
			
		function delete_request(friendname){
			socket.emit('delete request', friendname,"<%= user._id %>","<%= user.user.firstname %>");
			//$('#cancel_request').fadeOut(800);		
		}	

		//update the friends list after adding him
  		socket.on('updateuserrs', function(data) {
  			$('#users').empty();
			var html = '<div style="background-color:#A8A8A8; height:30px; width:100%;padding:1px; border: 1px solid #404040 "><h4 style="font-family:Exo; color:black;" align="center">Friend List</h4></div> <ul><% for(var i=0; i<friends.length; i++) { %><li><a  style="font-family:Exo" href="#" >'
    			$.each(data, function(key, value) {
				var str = "<%= friends[i] %>";
				if(key =="<%= friends[i] %>") {
					if(html.indexOf(str) != -1){
						html += ''
					}else{
						html += '<%= friends[i] %>'
					}	
   				}else{
					if(html.indexOf(str) != -1){
						html += ''
					}else{
						html += '<%= friends[i] %>'
					}	
				}
			});
			html +=  '</a></li><% } %> </ul>'
			$('#users').append(html)
  		});

		jQuery.browser = {};
		(function () {
    			jQuery.browser.msie = false;
    			jQuery.browser.version = 0;
    			if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        			jQuery.browser.msie = true;
        			jQuery.browser.version = RegExp.$1;
    			}
		})();
		
		//for auto-complete search function
		$(function () {
  			$("#search-query").autocomplete({
     				source: function (request, response) {
         				$.ajax({
           					url: "/search_member",
            					type: "GET",
            					data: request,  // request is the value of search input
            					success: function (data) {
              					// Map response values to fiedl label and value
               						response($.map(data, function (el) {
								socket.emit('search result', el.user.firstname,el.user.address);
                  						return {
                     							label: el.user.firstname+', '+el.user.address,
                    							value: el._id
                  						};
                  					}));
					}
               				});
            				
         			},
         
         	// The minimum number of characters a user must type before a search is performed.
         	minLength: 3, 
         
         	// set an onFocus event to show the result on input field when result is focused
         	focus: function (event, ui) { 
            		this.value = ui.item.label; 
            	// Prevent other event from not being execute
            		event.preventDefault();
         	},
         	select: function (event, ui) {
            		// Prevent value from being put in the input:
            		this.value = ui.item.label;
            		// Set the id to the next input hidden field
            		$(this).next("input").val(ui.item.value); 
            		// Prevent other event from not being execute            
            		event.preventDefault();
            		// optionnal: submit the form after field has been filled up
            		$('#quicksearch').submit();
         	}
	});

	$('#search-query').keypress(function(e){
		$('#search_result').empty();	
	});	

	});

	

	var peerid = {};
	var friendsonline = {};
	var socket = io.connect();

	socket.on('search result', function(name, add){
		$('#search_result').append('<div><a id="namerequest">' + name + ', ' + add + '</a>'+ ' &nbsp;    ' +'<a href="#" id="search-result" onclick="friendrequest(\''+name+'\',\''+add+'\')">Add</a></div>'); 	
	});

	function friendrequest(name, add){
		socket.emit('friend request',"<%= user._id %>", name, add, "<%= user.user.firstname %>");
		$('#namerequest').fadeOut(800);
		$('#search-result').fadeOut(800);	
	}

	socket.on('friend request', function(friendname, friendadd, username){
		var ids = "add"+friendname;
		$('#friendrequest').append('<div id="ids">'+ username +' has requested to add you.    <a href="#" id="add" onclick="addrequest(\''+ username +'\',\''+ "<%= user._id %>" +'\',\''+ "<%= user.user.firstname %>" +'\',\''+ids+'\')">Add</a>      <a id="cancel" onclick="deleterequest()">Cancel</a>');	
	});
	
	function addrequest(friendname,userid, username,ids){
		location.reload();
		socket.emit('add new friend', friendname, userid, username);
		$(ids).fadeOut(800);	
	}
	
	function deleterequest(friendname){
		socket.emit('delete request', friendname,"<%= user._id %>","<%= user.user.firstname %>");
		//$('#cancel_request').fadeOut(800);		
	}



	//sends the first name of the user that logins
	socket.on('connect', function(){
		peer.on('open', function(){	
			socket.emit('names' , "<%= user.user.firstname %>", peer.id);
		});
	});

	socket.on('peerid', function(data){
		$.each(data, function(key, value){
			peerid[key] = value;
			//alert(peerid[key]);					
		});
	});
	
	//shows online friends from his friendlist
	socket.on('friends', function(data){
		$('#online').empty();
		$.each(data, function(key ,value){
			if(value in friendlist){
				friendsonline[key] = value;
				//alert(peerid[friendsonline[key]]);	
				$('#online').append('<b><a align="left" href="#" onclick="switchName(\''+ friendsonline[key] + '\')">' + friendsonline[key] + '</a>      <a href="#" class="btn btn-info" onclick="nametotextbox(\''+ peerid[friendsonline[key]] +'\')" id="make-call" style="margin-right:.5rem">Video Call</a></b><br><a>__________________________________</a>');
			}	
		});
	});



	function nametotextbox(name){
		$('#videochat-tab').fadeIn(1600);
		$('#callto-id').val(name);
       		// Initiate a call!
       		var call = peer.call($('#callto-id').val(), window.localStream);
        	step3(call);
	}
	
	// function to generate pop-up and private chat when clicked online friend
	function switchName(key){
		socket.emit('get log data', "<%= user.user.firstname %>", key);	
		switchname(key);
	}
	
	function switchname(key){
		var wId= "to_"+key;
         	var privateDiv = document.getElementById('PrivateTab');
                var privateBox = document.createElement('div');

		$(privateBox).attr({
   			'style': 'overflow-y:none;'
  		});
 
		var privateTitle = document.createElement('div');
  		$(privateTitle).attr({
   			'style': 'width:200px; position:fixed; background-color: #A8A8A8; color: black;',
  		});
  		$(privateTitle).append("Private: "+ key);
  		privateBox.appendChild(privateTitle);
		
		var privateChatDiv = document.createElement('div');
  		$(privateChatDiv).attr({
				'style': "overflow-y:auto;",
	   		'id': wId + "_text"
		  });
  		privateBox.appendChild(privateChatDiv);
  
  		var privateChat = document.createElement('div');
  		$(privateChat).attr({
	   		'id': wId + "_text"
		  });
  		privateChatDiv.appendChild(privateChat);
  
 		var privateBreak = document.createElement('br');
  		privateBox.appendChild(privateBreak);
	
		var privatediv = document.createElement('div');
  		$(privatediv).attr({
	   		'style': "position:fixed; float:bottom; bottom:0px;color:black;"
		  });
  		privateBox.appendChild(privatediv);
  
  		var privateText = document.createElement('input');
  		$(privateText).attr({
   			'id': wId + "_data",
   			'type': "text"
  		});
  		privatediv.appendChild(privateText);
  
  		var privateSend = document.createElement('input');
  		$(privateSend).attr({
				
   			'id': wId + "_send",
   			'type': "button",
   			'value': "Send"
  		});
  		privatediv.appendChild(privateSend);
		privateBox.appendChild(privatediv);
  
  		$(privateBox).attr({
   			'id': wId,
   			'style': 'float: right; width: 220px; height: 200px; overflow-x: auto; border-radius: 6px; border: 1px #BBB solid;',
  		});

               	privateDiv.appendChild(privateBox);
  
  	       	$(privateSend).click(function(){
   			 var messagetosend = $('#to_'+key+"_data").val();
  			$('#to_'+key+"_text").append("<div class='bubble'><b>Me: </b>" + messagetosend + "</div>");
			$('#to_'+key+"_text").val('');
  			socket.emit('sendprivatechat',"<%= user.user.firstname %>", key, messagetosend);
    	       });	
	}
	
	//function for private message
	socket.on('getprivatemsg', function(sender, key, message) {
  		var elem = document.getElementById('to_'+sender+"_text");
  		if(typeof(elem) != 'undefined' && elem != null){
   
  		}else{
   			switchName(sender);
  		}
	
  		var elem = document.getElementById('to_'+sender+"_text");
  		$(elem).append('<div class="bubble bubble--alt">' + message + '</div>');
        });

	socket.on('get chat history', function(from, to, mesg){
		var elem = document.getElementById('to_'+to+"_text");
  		$(elem).append('<div>' + mesg + '</div>');
	});

	

