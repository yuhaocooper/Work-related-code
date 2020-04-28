function Shopify_Create_Fulfillment(orderId,guid,i){
  //loop through the dates of all the orders in the current order page
  //var resource = '#'+orderid+'/fulfillments/#'+fulfillmentid+'/complete'
  var url =  'https://'+hostname+'/admin/api/'+version+'/orders/'+orderId+'/fulfillments.json'
  var body = {
    'fulfillment':{
      'location_id': locationid,
      'tracking_number': guid,
      'tracking_company': 'xxx',
      'tracking_urls' : ['xxx'+guid]
    }
  }
  var request = UrlFetchApp.fetch(url,{
    'method': 'post',
    'contentType': 'application/json',
    'headers': {
      'Authorization': 'Basic '+ Utilities.base64Encode(key+':'+password)
    },
    'payload': JSON.stringify(body)
  });
  var json = request.getContentText();
  var data = JSON.parse(json);
  Logger.log(data)
  openSheet.getRange(i, 10).setValue(JSON.stringify(data['fulfillment']['id']))
  //Logger.log(data['orders'][0]['id'])
  //sheet.getRange(3, 1).setValue(JSON.stringify(data['orders'][0]['id']))
  
}
