//function to update fulfillmentevent. Ran as part of Versafleet poll.
function Shopify_Update_Fulfillment_Event(status,orderId,fulfillmentId){
  var url =  'https://'+hostname+'/admin/api/'+version+'/orders/'+orderId+'/fulfillments/'+fulfillmentId+'/events.json'
  var body = {
    'event':{
      'status': status
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
}
