function jobcheck(date,Type,FullName,ContactNumber,Email,AddressLine,Unit,PostalCode,start_time,end_time,tags,guid) {
  // GET call to find if there are any jobs created for the date of each task already
  var request = UrlFetchApp.fetch('https://api.versafleet.co/api/v2/jobs?client_id='+client+'&client_secret='+secret+'&date='+date+'&state=in_progress&archived=false'); //javascript uses "+" for adding variables to strings
  var json = request.getContentText();
  var data = JSON.parse(json);
  
  if (data["jobs"].length === 0 ) {   //data["jobs"].length = 0, there are no jobs created for the day yet. It means that are no objects inside the data["jobs"] object. Tested and valid.
    
      //Function to create the delivery job
      create_deliveryjob(date)
      var request = UrlFetchApp.fetch('https://api.versafleet.co/api/v2/jobs?client_id='+client+'&client_secret='+secret+'&date='+date+'&state=in_progress&archived=false'); //javascript uses "+" for adding variables to strings
      var json = request.getContentText();
      var data = JSON.parse(json);
      var jobid = data["jobs"][0]["id"]
      
      //Function to create the task
      create_task(jobid,FullName,ContactNumber,Email,AddressLine,Unit,PostalCode,date,start_time,end_time,tags,guid)
      //var source = sheet.getRange('A'+i+':L'+i)
      //source.copyTo(recordRange, {contentsOnly: true})
      //source.clearContent()
  }
  else{
    
    //code to get the JOBid for the delivery/return and add it to the task creation code.
    var x = 0;
    var jobid = "";
    var length = data["jobs"].length -1
    
    for (x = length ; x>=0 ; x--) { // Reversing the loop so that we take the latest jobid instead of the oldest on the list "==" for non 
      if (data["jobs"][x]["job_type"] == Type) {
        var jobid = data["jobs"][x]["id"] //Getting the Jobid for the delivery_type of the task
        break
      }
    }
    
    if (jobid == "") {
      //create a job and the task for case where there is a job on the date, but it is not the right type

        create_deliveryjob(date);
        var request = UrlFetchApp.fetch('https://api.versafleet.co/api/v2/jobs?client_id='+client+'&client_secret='+secret+'&date='+date+'&state=in_progress&archived=false'); //javascript uses "+" for adding variables to strings
        var json = request.getContentText();
        var data = JSON.parse(json);
        var length = data["jobs"].length-1
        var jobid = data["jobs"][length]["id"]
        
        create_task(jobid,FullName,ContactNumber,Email,AddressLine,Unit,PostalCode,date,start_time,end_time,tags,guid)
        //var source = sheet.getRange('A'+i+':L'+i)
        //source.copyTo(recordRange, {contentsOnly: true})
        //source.clearContent()

    }
    else {
      //take the jobid and create the task using the jobid
      
      create_task(jobid,FullName,ContactNumber,Email,AddressLine,Unit,PostalCode,date,start_time,end_time,tags,guid)
      //var source = sheet.getRange('A'+i+':L'+i)
      //source.copyTo(recordRange, {contentsOnly: true})
      //source.clearContent()
 
      
    }
  }
}
