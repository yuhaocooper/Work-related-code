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

//Creating the onFormSubmit trigger. Needs to only be done once to create the it.
function trigger(){
  var form = FormApp.openById('1hLcsq67m3-rTOZd0akrhhRg3ZIpHxKE_XY9T2LZ5Cq8') // Ad-hoc Google Form ID
  ScriptApp.newTrigger('form_response_prod') //Triggers the "form_response_prod" function
  .forForm(form)
  .onFormSubmit()
  .create();
}

function form_response_prod() {
// Link to the form itself: https://docs.google.com/forms/d/1hLcsq67m3-rTOZd0akrhhRg3ZIpHxKE_XY9T2LZ5Cq8/edit
  var form = FormApp.openById('1hLcsq67m3-rTOZd0akrhhRg3ZIpHxKE_XY9T2LZ5Cq8')
//Step 1: Upload the data into the database
  var formResponses = form.getResponses();
//Get the latest response
  var formResponse = formResponses[formResponses.length-1];
  var itemResponses = formResponse.getItemResponses();
  var answers = [] //blank array to store all the itemResponses
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
//Store all these values in the 'answer' array through the looping of all the responses in the form     
    answers.push(itemResponse.getResponse())
  }
  Logger.log(answers)
  
//Match the responses to the respective fields in the 'Consignors Master Details' Sheet
  var Jobtype = answers[0]
  var Name = answers[1]
  var Contact = answers[2]
  var Email = answers[3]
  var Address = answers[4]
  var UnitNum = answers[5]
  var Postal = answers[6]
  var Date = answers[7]
  var Timeslot = answers[8]
  var Tags = answers[9]
  var Notes = answers[10]
    
//Getting lastrow based on the 'Address' columns. Counts the number of non-empty cells in the column.
  var Avals = sheet.getRange("E1:E").getValues();
  var Alast = Avals.filter(String).length;
  var Lrow = Alast + 1 
  
//Putting the form responses in the "WOW" sheet

  sheet.getRange(Lrow, 1).setValue(Jobtype)
  sheet.getRange(Lrow, 2).setValue(Name)
  sheet.getRange(Lrow, 3).setValue(Contact)
  sheet.getRange(Lrow, 4).setValue(Email)
  sheet.getRange(Lrow, 5).setValue(Address)
  sheet.getRange(Lrow, 6).setValue(UnitNum)
  sheet.getRange(Lrow, 7).setValue(Postal)
  sheet.getRange(Lrow, 8).setValue(Date)
  sheet.getRange(Lrow, 9).setValue(Timeslot)
  sheet.getRange(Lrow, 10).setValue(Tags)
  sheet.getRange(Lrow, 11).setValue(Notes)
  
  }
