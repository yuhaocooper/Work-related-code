//To poll Versafleet (FMS) to update Shopify order statuses as Versafleet is unable to have dual webhooks

function Versafleet_Poll(){
  var activelastrow = openSheet.getLastRow()
  var startingrow = 2
  var wowType = 'xxx'
  var scType = 'xxx'
  //Reverse loop as there is a possibility of deleting a row for successful delivery tasks
  for (i=activelastrow;i>1;i--){
    //Try-catch to not skip self-collect orders
    if (openSheet.getRange(i,9).getValue() != wowType){
      continue
    }
    else{
      var guid = openSheet.getRange(i, 7).getValue();
      var orderId = openSheet.getRange(i,8).getValue();
      var fulfillmentId = openSheet.getRange(i, 10).getValue();
      if (fulfillmentId == ''){
        continue
      }
    //Try-catch to continue loop on Self-collect orders
      try{
        var request = UrlFetchApp.fetch('https://api.versafleet.co/api/tasks/'+guid+'?client_id='+client+'&client_secret='+secret)
        }
      catch (e){
        // check if its a self-collect, if yes, then update fulfillment_event
        continue
      }
      var json = request.getContentText();
      var data = JSON.parse(json);
      var state = data['task']['state']
      if (state == 'successful'){
        //Code to hit Shopify API to change fulfillment event status to 'delivered'
        Shopify_Update_Fulfillment_Event('delivered',orderId,fulfillmentId)
        //+Code to move the line of data to completedSheet
        var completedNextEmptyRow = completedSheet.getLastRow()+1
        var source = openSheet.getRange('A'+i+':J'+i)
        source.copyTo(completedSheet.getRange(completedNextEmptyRow,1),{contentsOnly: true})
        openSheet.deleteRow(i)      
      }
      else if (state == 'failed'){
        //Code to hit Shopify API to change fulfillment event status to 'failure'
        Shopify_Update_Fulfillment_Event('failure',orderId,fulfillmentId)
      }
      else if (state == 'acknowledged'){
        //Code to hit Shopify API to change fulfillment event status to 'out_for_delivery'
        Shopify_Update_Fulfillment_Event('out_for_delivery',orderId,fulfillmentId)
        //Use Shopify's Email notification for 'shipping confirmation' as it has link to shopify order status page
      }
    }
  }
}
