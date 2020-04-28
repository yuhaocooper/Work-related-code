function create_deliveryjob(date) {

 var datestr = formatDate(date) //Changing the date format to yyyy-mm-dd format

// delivery createjob body
  
  var body = {
    'job': {
      'job_type': 'delivery',
      'remarks': 'testdatetime1',
      'customer_id': customerid,
      'base_task_attributes': {
        'time_from': datestr+'T09:30:00+08:00', //date + time of 9:30am
        'time_to': datestr+'T10:30:00+08:00', //date + time of 10:30am
        'time_type': 'custom',
        'address_attributes': {
          'line_1': '100G Pasir Panjang Rd',
          'country': 'Singapore',
          'name': 'Style Theory Office',
          'zip': 118523,
          'line_2': 'xxx',
          'city': 'Singapore',
          'email': 'xxx',
          'contact_person': 'Tan Yu Hao',
          'contact_number': 'xxx',
          'longitude': 'xxx',
          'latitude': 'xxx'  
        },
      },
    }
  };
    
  var payload = JSON.stringify(body)
  
  var options = {
    "method" : "POST",
    "contentType" : "application/json",
    "payload" : payload
    };

  var request = UrlFetchApp.fetch('https://api.versafleet.co/api/v2/jobs?client_id='+client+'&client_secret='+secret,options); //javascript uses "+" for adding variables to strings
 
  var json = request.getContentText();
  var data = JSON.parse(json);
  
}
