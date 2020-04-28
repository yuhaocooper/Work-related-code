function create_task(jobid,FullName,ContactNumber,Email,AddressLine,Unit,PostalCode,date,start_time,end_time,tags,guid){

//creating task doesn't matter about job type

var datestr = formatDate(date)

var body = {
  'task_attributes': {
    'job_id': jobid,
    'time_type': 'custom',
    'time_from': datestr+"T"+start_time+":00+08:00",
    'time_to': datestr+"T"+end_time+":00+08:00",
    'address_attributes': {
    'line_1': AddressLine,
    'country': 'Singapore',
    'zip': PostalCode,
    'line_2': Unit,
    'city': 'Singapore',
    'email': Email,
    'contact_person': FullName,
    'contact_number': '+65'+ContactNumber,
    },
    'tag_list': [tags]
}
};
  
  var payload = JSON.stringify(body)
  
  var options = {
    "method" : "POST",
    "contentType" : "application/json",
    "payload" : payload
    };

var request = UrlFetchApp.fetch('https://api.versafleet.co/api/tasks?client_id='+client+'&client_secret='+secret,options); //javascript uses "+" for adding variables to strings
var json = request.getContentText();
var data = JSON.parse(json);

var trackingid = data['task']['guid']
guid.setValue(trackingid)

}
