/*
Function to automate the export of drivers daily performance onto Google Sheet as backend data was not integrated properly with Versafleet
to pull the necessary actionable data.

Enabled the team to improve on-time delivery by 10%.

*/

// Looping functions to get around execution timelimit resource: https://stackoverflow.com/questions/41971806/how-can-i-increase-the-6-minute-execution-limit-in-google-apps-script?noredirect=1&lq=1
function Daily_GetRepeating() {
  Daily_Get();
}

function Daily_Get() {
  var datasheet = ss.getSheetByName('VF Data')
  var date = new Date()
  var day = date.getDay()
  //Don't run the script on Mondays
  if (day == 1){
    return
  };
  var daydiff = 1000*60*60*24
  var today = Utilities.formatDate(new Date(date.getTime()), 'Asia/Singapore', 'yyyy-MM-dd');
  var yesterday = Utilities.formatDate(new Date(date.getTime() - daydiff), 'Asia/Singapore', 'yyyy-MM-dd');
  var lastrow = datasheet.getLastRow();
  
  var request = UrlFetchApp.fetch('https://api.versafleet.co/api/tasks?client_id='+client+'&client_secret='+secret+'&date='+yesterday+'&per_page=9999')
  var json = request.getContentText();
  var data = JSON.parse(json);
  var length = data['tasks'].length
  var array = []
  var startTime = new Date(), isOverMaxRuntime = false,functionName = arguments.callee.name,repeatingFunctionName = functionName + 'Repeating' //calc elapsed time
  
  // Deletes all occurrences of the Repeating trigger we don't end up with undeleted time based triggers all over the place
  //add library GASRetry MGJu3PS2ZYnANtJ9kyn2vnlLDhaBgl_dE
  GASRetry.call(function(){ScriptApp.getProjectTriggers().forEach(function(i) {
    if (i.getHandlerFunction() === repeatingFunctionName) {ScriptApp.deleteTrigger(i);}
  });});
  
  // Handle max execution times in our outer loop
  // Get start index if we hit max execution time last run
  var start = parseInt(PropertiesService.getScriptProperties().getProperty(functionName + "-start")) || 0;
  Logger.log(start)
  Logger.log(lastrow)
  
  if (start == 0){
  try{
    datasheet.getRange(2, 1, lastrow-1, 7).clear(); //Clear the data if 'start' == 0, meaning its a new day's tasks
  }
  catch(e){
    datasheet.getRange(2, 1, 1, 7).clear()
  }
  }
  
  for (i=start;i<length;i++){
    if (Math.round((new Date() - startTime)/1000) > 300) { //360 seconds is Google Apps Script max run time
      //We've hit max runtime. 
      isOverMaxRuntime = true;
      break;
    }
    var Trackingid = data['tasks'][i]['guid']
    
    //Get details of each task while looping through the guid
    try{
      var request = UrlFetchApp.fetch('https://api.versafleet.co/api/tasks/'+Trackingid+'?client_id='+client+'&client_secret='+secret)
    }
    catch (err){
      //save state in user/project prop if required
      PropertiesService.getScriptProperties().setProperty(functionName + '-start', i);
      //create another trigger
      GASRetry.call(function(){ScriptApp.newTrigger(repeatingFunctionName).timeBased().everyMinutes(10).create();});
      Logger.log('API error, retrying from i', i-1)
    }
    var json = request.getContentText();
    var taskdata = JSON.parse(json);
    //Start time of time slot "10:00". No dependency on string formatting of the datetime object taken from VF because we're taking the datetime value
    var StartTime = Utilities.formatDate(new Date(taskdata['task']['time_from']),'Asia/Singapore', 'HH:mm')
    //End time of time slot "14:00". No dependency on string formatting of the datetime object taken from VF because we're taking the datetime value
    var EndTime = Utilities.formatDate(new Date(taskdata['task']['time_to']),'Asia/Singapore', 'HH:mm')
    var TaskType = taskdata['task']['job']['job_type'] //pickup == pickup, delivery == delivery task
    Logger.log(taskdata['task']['last_successful_at'])
    if ( taskdata['task']['last_successful_at'] != null){
      var CompletedTime = Utilities.formatDate(new Date(taskdata['task']['last_successful_at']),'Asia/Singapore', 'HH:mm') // corresponds accordingly to either the collected time or delivered time for deliveries
    }
    else{
      var CompletedTime = ''
    }
    Logger.log(CompletedTime)
    var TimeSlot = StartTime.toString() + '-' + EndTime.toString() // "10:00-14:00"
    try {
    var Driver = taskdata['task']['task_assignment']['driver']['name']
    }
    catch(e){
    var Driver = ''
    }
    
    //Setting the values in the sheet
    datasheet.getRange(i+2, 1, 1,7).setValues([[Trackingid,TaskType,Driver,TimeSlot,StartTime,EndTime,CompletedTime]]);
  };
    if (isOverMaxRuntime) {
      //save state in user/project prop if required
      PropertiesService.getScriptProperties().setProperty(functionName + '-start', i);
      //create another trigger
      GASRetry.call(function(){ScriptApp.newTrigger(repeatingFunctionName).timeBased().everyMinutes(10).create();});
      Logger.log('Hit max run time - last iteration completed was i=%s', i-1);
    } else {
      Logger.log('Done all the work and all iterations');
      PropertiesService.getScriptProperties().deleteProperty(functionName + '-start');
      Logger.log('Completed processing all %s things with the "%s" function', length, functionName);
    }
}
