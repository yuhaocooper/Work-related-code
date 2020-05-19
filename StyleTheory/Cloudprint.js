//cloud print instructions: https://stackoverflow.com/questions/49291965/print-in-google-script-using-add-ons-or-google-extensions
//example of automatically printing the new file in a specific folder: https://ctrlq.org/code/20061-google-cloud-print-with-apps-script
//console cloud
// https://developers.google.com/drive/api/v3/push : using google drive push notification to listen for changes in a folder, then GET the 

//----------------------------------------------------------------------------OAuth2 Steps and code---------------------------------------------------------------------------------------------

//Steps - 8th August - This apps script project has been authorized
//1: Create a new GCP project
//2: Get the client_id and secret ids from the credentials page
//3: Authorize the redirect URLs to "https://script.google.com/macros/d/[script_id]/usercallback" 
//4: Run the showURL() function to authorize the OAuth2
//5: View 'Execution transcript'
//6: Click on "OK" on the webpage for the redirect link and allow access
//7: A page should show "You can now use Google Cloud Print from Apps Script."
//8: The webapp is connected to the Google Cloud Printing and time to run all the printing codes.

var project_key = 'xxx' //Taken from the 'Project properties' of the script
var script_id = 'xxx' //Taken from the 'Project properties' of the script

var client_id = 'xxx' //Taken from Google cloud platform console
var secret = 'xxx' //Taken from Google cloud platform console

function showURL() {
  var cpService = getCloudPrintService();
  if (!cpService.hasAccess()) {
    console.log(cpService.getAuthorizationUrl());
  }
}

function getCloudPrintService() {
  return OAuth2.createService('print')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId(client_id)
    .setClientSecret(secret)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('https://www.googleapis.com/auth/cloudprint')
    .setParam('login_hint', Session.getActiveUser().getEmail())
    .setParam('access_type', 'offline')
    .setParam('approval_prompt', 'force');
}

function authCallback(request) {
  var isAuthorized = getCloudPrintService().handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('You can now use Google Cloud Print from Apps Script.');
  } else {
    return HtmlService.createHtmlOutput('Cloud Print Error: Access Denied');
  }
}


// -----------------------------------------------------------------------end of OAuth2 code---------------------------------------------------------------------------------------------------

function getPrinterList() {
  var response = UrlFetchApp.fetch('https://www.google.com/cloudprint/search', {
    headers: {
      Authorization: 'Bearer ' + getCloudPrintService().getAccessToken()
    },
    muteHttpExceptions: true
  }).getContentText();
  var printers = JSON.parse(response).printers;
  for (var p in printers) {
    Logger.log("%s %s %s", printers[p].id, printers[p].name, printers[p].description);
  }
}


function printGoogleDocument(docID, printerID, docName) {

  var ticket = {
    version: "1.0",
    print: {
      color: {
        type: "STANDARD_COLOR",
        vendor_id: "Color"
      },
      duplex: {
        type: "NO_DUPLEX"
      },
      copies: {
        copies: 2
      },
    }
  };

  var payload = {
    "printerid" : printerID,
    "title"     : docName,
    "content"   : DriveApp.getFileById(docID).getBlob(),
    "contentType": "application/pdf",
    "ticket"    : JSON.stringify(ticket)
  };

  var response = UrlFetchApp.fetch('https://www.google.com/cloudprint/submit', {
    method: "POST",
    payload: payload,
    headers: {
      Authorization: 'Bearer ' + getCloudPrintService().getAccessToken()
    },
    "muteHttpExceptions": true
  });

  response = JSON.parse(response);

  if (response.success) {
    Logger.log("%s", response.message);
  } else {
    Logger.log("Error Code: %s %s", response.errorCode, response.message);
  }
}


// https://developers.google.com/drive/api/v3/push : using google drive push notification to listen for changes in a folder, then GET the docID of the new file, then sending it to the print function


// Log the name of every file in the user's Drive.
function check_and_print(){
  var files = DriveApp.getFolderById('xxx').getFiles() //The folder ID of where we are currently storing all the receipts pdf now
//Looping through all the files in the folder
  while (files.hasNext()) {
    var file = files.next();
    var createddate = file.getDateCreated()
// Checking for files that are created within the past 24 hours and only print those
    if (new Date() - createddate < 24 * 60 * 60 * 1000) {
    var docID = file.getId()
    var docName = file.getName()
    var printerID = 'xxx'
    printGoogleDocument(docID, printerID, docName)
    Logger.log('printed')
  }
  }
}
