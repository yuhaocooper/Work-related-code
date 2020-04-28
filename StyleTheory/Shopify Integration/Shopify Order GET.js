//To GET and record Shopify Order ID
function Shopify_Order_Get(){
  //var resource = '#'+orderid+'/fulfillments/#'+fulfillmentid+'/complete'
  var url =  'https://'+hostname+'/admin/api/'+version+'/orders/2044598255753.json'
  var request = UrlFetchApp.fetch(url,{
    'method': 'get',
    'contentType': 'application/json',
    'headers': {
      'Authorization': 'Basic '+ Utilities.base64Encode(key+':'+password)
    }
  });
  var json = request.getContentText();
  var data = JSON.parse(json);
  
  openSheet.getRange(5,1).setValue(JSON.stringify(data['order']['shipping_lines']))
  //sheet.getRange(3, 1).setValue(JSON.stringify(data['orders'][0]['id']))
}
