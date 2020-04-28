//this is a function that fires when the webapp receives a POST request
//v1 working - 1500ms avg response time

function doPost(e) {
  var mydata = JSON.parse(e.postData.contents);
  var trackingid = mydata['data']['tracking_id']
//check to only record if its a change to 'started' for all tasks
  if(mydata['updates']['state'][1] == 'started'){
//check if the task is part of Idlist
    var lastRow = datasheet.getLastRow()
    var range = datasheet.getRange("E1:E"+ lastRow);
    var Idlist = range.getValues();
    var ylength = Idlist.length //Equals to row number
    for ( y= ylength - 1; y>0; y--){ 
      if (Idlist[y] == trackingid){
        var tasktype = datasheet.getRange(y+1, 1).getValue();
        var contactperson = datasheet.getRange(y+1, 2).getValue();
        var contactnumber = datasheet.getRange(y+1, 3).getValue();
        var contactnumber = contactnumber.substring(contactnumber.length - 8, contactnumber.length);
        var drivercontact = datasheet.getRange(y+1, 4).getValue();
        var pickupstartedmsg = 'notification msg'
        var deliverystartedmsg = 'notification msg'
        //rest of code to record and send the sms
        if (tasktype == 'pickup'){
          //Code for Twilio
          var sender = 'xxx'
          var options = {
            'method' : 'post',
            'payload' : {
              'From': sender,
              'To': '+65' + contactnumber,
              'Body': pickupstartedmsg
            },
            'headers': {
              'authorization': 'Basic xxx',
              'content-type': 'application/x-www-form-urlencoded'
            }
          };
          try{
            //Send SMS to twilio
            UrlFetchApp.fetch('https://api.twilio.com/2010-04-01/Accounts/xxx/Messages.json', options); 
            //Confirmation of sent SMS notification sent to Slack channel #failedversafleetsms
            UrlFetchApp.fetch('https://hooks.slack.com/services/xxx/xxx/xxx', {
              'method': 'post',
              'payload': JSON.stringify({
                'text': 'Sent ' + trackingid
              }),
              'contentType': 'application/json'
            });
          }
          catch(err){
            UrlFetchApp.fetch('https://hooks.slack.com/services/xxx/xxx/xxx', {
              'method': 'post',
              'payload': JSON.stringify({
                'text': 'Failed to send sms for ' + trackingid
              }),
              'contentType': 'application/json'
            });
          }
          return //so that the loop stops when it finds a match
        }
        else if (tasktype == 'delivery'){
          //Code for Twilio
          var sender = 'StyleTheory'
          var options = {
            'method' : 'post',
            'payload' : {
              'From': sender,
              'To': '+65' + contactnumber,
              'Body': deliverystartedmsg
            },
            'headers': {
              'authorization': 'Basic xxx',
              'content-type': 'application/x-www-form-urlencoded'
            }
          };
          try{
            UrlFetchApp.fetch('https://api.twilio.com/2010-04-01/Accounts/xxx/Messages.json', options);
            //Confirmation of sent SMS notification sent to Slack channel #failedversafleetsms
            UrlFetchApp.fetch('https://hooks.slack.com/services/xxx/xxx/xxx', {
              'method': 'post',
              'payload': JSON.stringify({
                'text': 'Sent ' + trackingid
              }),
              'contentType': 'application/json'
            });
          }
          catch(err){
            UrlFetchApp.fetch('https://hooks.slack.com/services/xxx/xxx/xxx', {
              'method': 'post',
              'payload': JSON.stringify({
                'text': 'Failed to send sms for ' + trackingid
              }),
              'contentType': 'application/json'
            });
          }
          return //so that the loop stops when it finds a match
        }
      } 
    }
  }
  //webhook for completion of luxury_bag and consignment_bag tasks
  if(mydata['updates']['state'][1] == 'completed'){
    //check if the task is part of Idlist
    var lastRow = datasheet.getLastRow()
    var range = datasheet.getRange("E1:E"+ lastRow);
    var Idlist = range.getValues();
    var ylength = Idlist.length //Equals to row number
    for ( y= ylength - 1; y>0; y--){ 
      if (Idlist[y] == trackingid){
        var tasktype = datasheet.getRange(y+1, 1).getValue();
        var contactperson = datasheet.getRange(y+1, 2).getValue();
        var contactnumber = datasheet.getRange(y+1, 3).getValue();
        var contactnumber = contactnumber.substring(contactnumber.length - 8, contactnumber.length);
        var drivercontact = datasheet.getRange(y+1, 4).getValue();
        var tags = datasheet.getRange(y+1, 5).getValue().indexOf('luxury_bag') + datasheet.getRange(y+1, 5).getValue().indexOf('consignment_bags')
        var date = new Date()
        var datetime = Utilities.formatDate(new Date(date.getTime()), 'Asia/Singapore', 'yyyy-MM-dd hh:mm a')
        var completedeliverymsg = contactperson + ",your designer bag has been delivered at "+datetime+". If you didn't receive it, please chat with us in-app."
        //rest of code to record and send the sms
        if (tasktype == 'delivery' && (datasheet.getRange(y+1, 6).getValue().indexOf('luxury_bag') >= 0 || datasheet.getRange(y+1, 6).getValue().indexOf('consignment_bags') >= 0)){
          //Code for Twilio
          var sender = 'xxx'
          var options = {
            'method' : 'post',
            'payload' : {
              'From': sender,
              'To': '+65' + contactnumber,
              'Body': completedeliverymsg
            },
            'headers': {
              'authorization': 'Basic xxx',
              'content-type': 'application/x-www-form-urlencoded'
            }
          };
          try{
            UrlFetchApp.fetch('https://api.twilio.com/2010-04-01/Accounts/xxx/Messages.json', options);
            //Confirmation of sent SMS notification sent to Slack channel #failedversafleetsms
            UrlFetchApp.fetch('https://hooks.slack.com/services/xxx/xxx/xxx', {
              'method': 'post',
              'payload': JSON.stringify({
                'text': 'Sent ' + trackingid
              }),
              'contentType': 'application/json'
            });
          }
          catch(err){
            UrlFetchApp.fetch('https://hooks.slack.com/services/xxx/xxx/xxx', {
              'method': 'post',
              'payload': JSON.stringify({
                'text': 'Failed to send sms for ' + trackingid
              }),
              'contentType': 'application/json'
            });
          }
          return //so that the loop stops when it finds a match
        }
      } 
    }
  }
  //Changing drivers numbers when they are newly assigned to a task
  if(mydata['updates']['state'][1] == 'assigned'){
    //check if the task is part of Idlist
    var lastRow = datasheet.getLastRow()
    var range = datasheet.getRange("E1:E"+ lastRow);
    var Idlist = range.getValues();
    var ylength = Idlist.length //Equals to row number
    for ( y= ylength - 1; y>0; y--){ 
      if (Idlist[y] == trackingid){
        var driverid = mydata['updates']['task_assignment']['driver_id'];
        //loop through the drivers list
        var DIDlastrow = ss.getSheetByName('Drivers list').getLastRow();
        var DIDrange = ss.getSheetByName('Drivers list').getRange("A1:A"+ DIDlastrow)
        var DIDlist = DIDrange.getValues();
        var zlength = DIDlist.length;
        for (z = 0; z<zlength;z++){
          if (DIDlist[z] == driverid){
            var driverscontact = ss.getSheetByName('Drivers list').getRange(z+1,3).getValue();
            datasheet.getRange(y+1, 4).setValue(driverscontact)
            return
          }
        }
      }
    }
  }
}  
