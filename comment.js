Parse.Cloud.afterSave('comment', function(request) {
  // Only send push notifications for new activities
  if (request.object.existed()) {
    return;
  }

  var postedby = request.object.get("statusOBJID");
  if (!toUser) {
    throw "Undefined toUser. Skipping push for Activity " + request.object.get('comment') + " : " + request.object.id;
    return;
  }


  var query = new Parse.Query(Parse.Installation);
  query.equalTo('user', toUser);

  Parse.Push.send({
    where: query, // Set our Installation query.
    data: alertPayload(request)
  }).then(function() {
    // Push was successful
    console.log('Sent push.');
  }, function(error) {
    throw "Push Error " + error.code + " : " + error.message;
  });
});
Parse.Cloud.define("comment", function(request,response){
  var query = new Parse.Query(Parse.User);
  var message = request.params.message;
   var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('User',request.params.User);

  Parse.Push.send({
    where: pushQuery,
    data : { 
      alert: message,
      badge: "Increment",
      sound: "",
    }
    }, {
    success: function(result) {
    console.log("request.params.User = " + JSON.stringify(request.params.User));
    response.success(result);
    },
    error: function(error) {
    console.log("request.params.User = " + JSON.stringify(request.params.User));;
    response.error(error)
    }
  });
});

var alertMessage = function(request) {
  var message = "";

  if (request.object.get("comment") === "commenttext") {
    if (request.user.get('postedby')) {
      message = request.user.get('postedby') + ': ' + request.object.get('statusOBJID').trim();
    } else {
      message = "Someone commented on your status update.";
    }

  }

  // Trim our message to 140 characters.
  if (message.length > 140) {
    message = message.substring(0, 140);
  }

  return message;
}

var alertPayload = function(request) {
  var payload = {};

  if (request.object.get("type") === "comment") {
    return {
      alert: alertMessage(request), // Set our alert message.
      badge: 'Increment', // Increment the target device's badge count.
      // The following keys help Anypic load the correct photo in response to this push notification.
      p: 'a', // Payload Type: Activity
      t: 'c', // Activity Type: Comment
      fu: request.object.get('postedby').id, // From User
      pid: request.object.id // 
     };
  }
}
