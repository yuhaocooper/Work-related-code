//Custom integration between our FMS (Versafleet) and Airtable
//Allows users of Airtable to create Versafleet orders for Airtable data with a click of a button in Google Sheets
//Records the tasks details in Google Sheets & also updates values in Airtable as feedback for the action

function CompilationD() {
  /*
  - The team updates the pre-approval sheet to pickup scheduled
  - api filters out these orders
  - paste consignorid/id + scheduled timeslot for next day in a sheet
  - Count the number of bags per consignor
  - takes address and contact details from the consignor tab
  - creates the vf order
  - creates the receipt
  - edit the airtable 'WA Followup Status' to 'pickup order created'
  - It will take the bottom most order for notes and time slot
  */
  
  //Listing out key variables  
  var idC = 1;
  var consignoridC = 2;
  var pickupdateC = 3;
  var timeslotC = 4;
  var remarksC = 5;
  var fullnameC = 6;
  var contactC = 7;
  var emailC = 8;
  var addressC = 9;
  var unitC = 10;
  var postalC = 11;
  var trackingidC = 12;
  var startingrow = 2;
  var airtablecolumn = 'Sent+to+Versafleet'
  var airtabletype = 'To+Be+Sent'; //filter for Preapproval table
  
  var Avals = sheetD.getRange("A2:A").getValues(); //Change to the column where the date is present. Counts the number of non-null cells in the column from row 2 onwards
  var Alast = Avals.filter(String).length;
  
  var url = 'https://api.airtable.com/v0/xxx/'+deliverytable+'?fields%5B%5D=Consignor+ID&fields%5B%5D=Return+Date&fields%5B%5D=Return+Time&fields%5B%5D=Versafleet+Notes&sort%5B0%5D%5Bfield%5D=Consignor%20ID&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=%7B'+airtablecolumn+'%7D%3D%22'+airtabletype+'%22' //Use API Encoder to do this shit - https://codepen.io/airtable/full/rLKkYB
  var headers = {'Authorization':'Bearer ' + yuhaoairtablekey};
  var options = {
    'contentType':'application/json',
    'method' : 'GET',
    'headers': headers,
  };
  var request = UrlFetchApp.fetch(url, options);
  var json = request.getContentText();
  var data = JSON.parse(json);
  Logger.log(data)
  
  //Recording all the Consignor ID, Pickupdate and Timeslot
  //Loop the response
  var i;
  
  for (i=0; i<data['records'].length;i++){
    try{
    var id = data['records'][i]['id']
    var consignorid = data['records'][i]['fields']['Consignor ID']
    var pickupdate = data['records'][i]['fields']['Return Date'].substring(0,10) //first 10 characters to find the date of the pickup
    var timeslot = data['records'][i]['fields']['Return Time']
    var airtableremarks = data['records'][i]['fields']['Versafleet Notes']
    // setting blank airtableremarks to ''
    if (airtableremarks == null){
      var airtableremarks = ''
      }    
    sheetD.getRange(startingrow+i, idC).setValue(id)
    sheetD.getRange(startingrow+i, consignoridC).setValue(consignorid)
    sheetD.getRange(startingrow+i, pickupdateC).setValue(pickupdate)
    sheetD.getRange(startingrow+i, timeslotC).setValue(timeslot)
    sheetD.getRange(startingrow+i, remarksC).setValue(airtableremarks)
    }
    catch(err){   //If error, continue with the rest of the loop, while leaving the error message in column C
      sheetD.getRange(startingrow+i, idC).setValue(id)
      sheetD.getRange(startingrow+i, consignoridC).setValue(consignorid)
      sheetD.getRange(startingrow+i, pickupdateC).setValue('undefined') //setting the error as 'undefined' for easier filter later in the code
    continue
    }
  };
  
  //Resetting Alast as now we have filled up the column with the consignorID values
  var Avals = sheetD.getRange("A2:A").getValues();
  var Alast = Avals.filter(String).length; //re-assign Alast after adding in all the values
  
  for (i =0 ; i<Alast ;i++){
    var consignorid = sheetD.getRange(i+startingrow, consignoridC).getValue();
    var url = 'https://api.airtable.com/v0/appyLB1KCMO9vL6C9/Consignors/'+consignorid
    var headers = {'Authorization':'Bearer ' + yuhaoairtablekey};
    var options = {
      'contentType':'application/json',
      'method' : 'GET',
      'headers': headers,
  };
    var request = UrlFetchApp.fetch(url, options);
    var json = request.getContentText();
    var data = JSON.parse(json);
    
    Logger.log(data)
    
      sheetD.getRange(i+startingrow, fullnameC).setValue(data['fields']['Full Name']) //Full name
      sheetD.getRange(i+startingrow, contactC).setValue(data['fields']['Contact Number']) //contact number
      sheetD.getRange(i+startingrow, emailC).setValue(data['fields']['Email']) //email
      sheetD.getRange(i+startingrow, addressC).setValue(data['fields']['Add. 1 - Road']) //address
      sheetD.getRange(i+startingrow, unitC).setValue('#' + data['fields']['Add. 1 - Unit No.']) //Unit
      sheetD.getRange(i+startingrow, postalC).setValue(data['fields']['Add 1 - Postal Code']) //Postal code
     
  }
  
  var count = 1 //count has to be out of the loop, otherwise count++ is useless
  for (i=0 ; i<Alast ; i++){
    var errormsg = 'please fill in undefined details'
    var user = sheetD.getRange(i+startingrow, emailC).getValue()
    var nextuser = sheetD.getRange(i+startingrow+1, emailC).getValue()
    if (user == nextuser){
      count++;
      continue;
    } else{
      //check for undefined first 
      if ( sheetD.getRange(i+startingrow, pickupdateC).getValue() == 'undefined' || sheetD.getRange(i+startingrow, fullnameC).getValue() == 'undefined'|| sheetD.getRange(i+startingrow, contactC).getValue() == 'undefined'|| sheetD.getRange(i+startingrow, emailC).getValue() == 'undefined'|| sheetD.getRange(i+startingrow, addressC).getValue() == 'undefined'|| sheetD.getRange(i+startingrow, unitC).getValue() == 'undefined'|| sheetD.getRange(i+startingrow, postalC).getValue() == 'undefined') {
        var x = 0
        for (x = 0; x<count; x++){
          sheetD.getRange(i+startingrow-x, trackingidC).setValue(errormsg)
        }
      } else{ //create the VF order for all defined orders
        
        //details of the the order
        var type = 'delivery'
        var consignorid = sheetD.getRange(i+startingrow, consignoridC)
        var date = sheetD.getRange(i+startingrow, pickupdateC).getValue();
        var contact_person = sheetD.getRange(i+startingrow, fullnameC).getValue();
        var contact_number = sheetD.getRange(i+startingrow, contactC).getValue();
        var email = sheetD.getRange(i+startingrow, emailC).getValue();
        var address = sheetD.getRange(i+startingrow, addressC).getValue();
        var unit_number = sheetD.getRange(i+startingrow, unitC).getValue().toString();
        if ( unit_number.indexOf('#') == -1){
          unit_number = '#'+ unit_number
        }
        var postal = sheetD.getRange(i+startingrow, postalC).getValue();
        var time = sheetD.getRange(i+startingrow, timeslotC).getValue()
        var tags = 'consignment_bags'
        var remarks = 'Deliver '+count+' bag(s) (Take photo,sign and seal the bags in front of customer) ' + airtableremarks
        var guid = sheetD.getRange(i+startingrow, trackingidC);
        
        var time_string = JSON.stringify(time)
        var start_time = time.substring(0,5)
        var end_time = time.substring(8,14)
        
        //code for creating the order
        try{ //if Versafleet API error, Contact Yuhao to check for errors regarding hitting Versafleet API. Puts 'errormessage' in TrackingidC, and thus will be recorded in the 'missing detail' sheet
        jobcheckD(date,type,contact_person,contact_number,email,address,unit_number,postal,start_time,end_time,tags,remarks,guid) //need to edit guid and recordRange to apply to this sheet
        }
        catch (err){
          Browser.msgBox('Contact Yuhao with a screenshot of this error - '+err.message)
          var x = 0
          for (x = 0; x<count; x++){
          sheetD.getRange(i+startingrow-x, trackingidC).setValue(errormsg)
          };
          continue
        }
        //Recording the tracking ID
        var guidvalue = guid.getValue()
        var x = 0
        for (x = 0; x<count; x++){
          sheetD.getRange(i+startingrow-x, trackingidC).setValue(guidvalue) //to be changed to code fill with returned TrackingID
        };
      };
    };
  };
  
  //loop through each id to update airtable + return if successful
  var Avals = sheetD.getRange("A2:A").getValues();
  var Alast = Avals.filter(String).length;
  for (i=0; i<Alast; i++){
    var id = sheetD.getRange(i+startingrow, idC).getValue();
    var check = sheetD.getRange(i+startingrow, trackingidC).getValue();
    if (check != errormsg){
      PatchItemIdD(id) //code to update airtable
    } else{
      continue;
    };
  }
  
  //Loop, then copy and paste the rest to records sheet
  var Avals = sheetD.getRange("A2:A").getValues();
  var Alast = Avals.filter(String).length;
  for (i=0; i<Alast; i++){
    var check = sheetD.getRange(i+startingrow, trackingidC).getValue();
    if (check != errormsg){
      var CreatedRow = CreatedSheet.getLastRow()
      var CreatedRange = CreatedSheet.getRange(CreatedRow+1, 1)
      var source = sheetD.getRange(i+startingrow, 1,1,trackingidC) //numberofcolumns to be the last required column variable
      source.copyTo(CreatedRange, {contentsOnly: true})
      source.clearContent();
    }
    else {
      var MissingRow = MissingSheet.getLastRow()
      var MissingRange = MissingSheet.getRange(MissingRow+1, 1)
      var source = sheetD.getRange(i+startingrow, 1,1,trackingidC) //numberofcolumns to be the last required column variable
      source.copyTo(MissingRange, {contentsOnly: true})
      source.clearContent();
    }
  }
}
-------------------------------------------------------End of compiled function-----------------------------------------------------

function PatchItemIdD(id){
  var url = 'https://api.airtable.com/v0/appyLB1KCMO9vL6C9/'+deliverytable+'?' //Use API Encoder to do this shit - https://codepen.io/airtable/full/rLKkYB
  var headers = {'Authorization':'Bearer ' + maeganairtablekey}; //using maegan's key here
  var data = {
    'records':[
      {
        'id': id,
        'fields': {
          'Sent to Versafleet': 'Sent'
        }
      }
    ]
  }
  var options = {
    'contentType':'application/json',
    'method' : 'PATCH',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(data),
    'headers': headers,
  };
  var request = UrlFetchApp.fetch(url, options);
  var json = request.getContentText();
  var data = JSON.parse(json);
  Logger.log(data)
}
