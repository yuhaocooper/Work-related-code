function Fulfillment_Creation_Loop(){
  var lastrow = openSheet.getLastRow()
  var i = 0
  var wowType = 'xxx'
  var scType = 'xxx'
  //Reverse loop as there is a possibility of deleting a row for successful self-collect tasks
  for (i=lastrow;i>1;i--){
    //Creates the fulfillment for wow
    //Shopify Email and SMS fulfillment notification sent 1 day before delivery date
    //'out_for_delivery' email sent on delivery date
    if (openSheet.getRange(i,9).getValue() == wowType){
      var deliveryDate = openSheet.getRange(i, 6).getValue()
      deliveryDate.setDate(deliveryDate.getDate() - 1)
      var deliveryDay = deliveryDate.getDate()
      var date = new Date()
      var dateDay = date.getDate()
      if (deliveryDay == dateDay){
        //function Shopify_Create_Fulfillment()
        var orderId = openSheet.getRange(i, 8).getValue();
        var guid = openSheet.getRange(i, 7).getValue();
        try{
          Shopify_Create_Fulfillment(orderId,guid,i)
        }
        catch(e){
          continue
        }
      }
    }
    else {
      //Creates the fulfillment for Self-collect. Don't update the fulfillment_event at the same time as it gives less information on the order status page
      //Shopify Email and SMS notification are sent on the day of delivery date
      var deliveryDate = openSheet.getRange(i, 6).getValue()
      var deliveryDay = deliveryDate.getDate()
      var date = new Date()
      var dateDay = date.getDate()
      if (deliveryDay == dateDay){
        //function Shopify_Create_Fulfillment()
        var orderId = openSheet.getRange(i, 8).getValue();
        //'' guid for Self-collects
        var guid = 'Self Collect';
        try{
          Shopify_Create_Fulfillment(orderId,guid,i)
        }
        catch(e){
          continue
        }
      }
      else if (deliveryDay < dateDay){
        //+Code to move the line of data to completedSheet
        var completedNextEmptyRow = completedSheet.getLastRow()+1
        var source = openSheet.getRange('A'+i+':J'+i)
        source.copyTo(completedSheet.getRange(completedNextEmptyRow,1),{contentsOnly: true})
        openSheet.deleteRow(i)      
      }
    }
  }
}
