Parse.Cloud.afterSave("StatusUpdate", function(request){
  if(request.object.existed())
  {
    return;
  }

  // if the user is Undefined
  var toUser = request.object.get("user")
  if (!toUser)
  {
    throw "Undefined toUser. Skipping push for Activity " + request.object.get('StatusUpdate') + " : " + request.object.id;
    return;
  }

  // put Installation query here if needed


  // send notifications based on the StatusUpdate and the passed in user from ios
  Parse.Cloud.useMasterKey() // depreciated in self hosted parse servers


  // create query based on passed in values
  Parse.Cloud.define("StatusUpdate", function(request,response){
    //query Installation for user
    var Installationquery = Parse.Object.extend("Installation");
    var query = new Parse.Query(Installationquery);
    var message = request.params.message
    query.equalTo("user", request.params.User);
query.find({
  success: function(results) {
    response.success("found user" + results)

    // Do something with the returned Parse.Object values
    for (var i = 0; i < results.length; i++) {
      var object = results[i];
      Parse.Push.send({
    where: query, // Set our Installation query
    data: {
      alert: createMessage(message)
      //badge : "Increment"
      sound: "";
    }
  }, {
    success: function() {
      // Push was successful
      console.log("sent ")
    },
    error: function(error) {
      console.log("Error " + error)
    }
    }
  },
  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
});
  })



});

function createMessage(request)
{
  var message = ""

          if (request.object.get("StatusUpdate") === "likedby") {
              if (request.user.get('postedby')) {
                  message = request.user.get('postedby') + ': ' + request.object.get('statusOBJID').trim();
              } else {
                  message = "Someone liked on your status update.";
              }

              // Trim our message to 140 characters.
              if (message.length > 140) {
                  message = message.substring(0, 140);
              }

              return message;
          }
}
