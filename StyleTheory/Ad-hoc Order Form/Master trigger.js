//Compiled code to run the different functions to create the order in our FMS (Versafleet).
//Comprises of jobcheck() - To check if a job has been created on the day of order.
//create_deliveryjob() - To create a delivery job if its a delivery order, and a delivery job hasn't been created yet.
//create_pickupjob() - To create a pickup job if its a pickup order, and a pickup job hasn't been created yet.
//create_task() - To create the task within the job.
//The details of above mentioned functions can be found in the Shopify Integration folder.

function Master_Trigger() {
   
  //Finding the last and number of rows of data to loop through
  var Avals = sheet.getRange("A2:A").getValues(); //Change to the column where the date is present. Counts the number of non-null cells in the column from row 2 onwards
  var Alast = Avals.filter(String).length;
  
  Logger.log(Alast)
  Logger.log(sheet)
  
  var i;
  for (i = 2; i < Alast+2 ; i++){
    
    var type = sheet.getRange(i, 1).getValue()
    var contact_person = sheet.getRange(i, 2).getValue()
    var contact_number = sheet.getRange(i, 3).getValue()
    var email = sheet.getRange(i, 4).getValue()
    var address = sheet.getRange(i, 5).getValue()
    var unit_number = sheet.getRange(i, 6).getValue().toString()
    //To add # to unit_number if there isn't any
    if ( unit_number.indexOf('#') == -1){
      unit_number = '#'+ unit_number
    }
    var postal =  sheet.getRange(i, 7).getValue()
    var date = sheet.getRange(i, 8).getValue()
    var time = sheet.getRange(i, 9).getValue()
    var tags = sheet.getRange(i, 10).getValue()
    var remarks = sheet.getRange(i, 11).getValue()
    var guid = sheet.getRange(i, 12) //The range of GUID to place the guid value in
    var recordRange = recordSheet.getRange(recordRow+(i-1),1);
    
    var time_string = JSON.stringify(time)
    var start_time = time.substring(0,5)
    var end_time = time.substring(8,14)
    
    Logger.log(contact_person)
    //function to check if there is a job on date for the job type

    jobcheck(date,type,contact_person,contact_number,email,address,unit_number,postal,start_time,end_time,tags,remarks,guid,recordRange,i)
        
    //if no, then use create job function
    //if yes, then jobid, and create task to it
    //error handling
    //then next row of order
    
  };
}
