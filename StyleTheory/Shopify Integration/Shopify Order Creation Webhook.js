function doPost(e) {
  var mydata = JSON.parse(e.postData.contents);
  var Type = 'delivery'
  var wowType = 'Standard (2-5 Days)'
  var scType = 'Self Collection at Style Theory HQ (Next Day, 5-7PM)'
  var nextEmptyRow = openSheet.getLastRow() +1
  var FullName = mydata['customer']['first_name'] + ' ' + mydata['customer']['last_name']
  var AddressLine = mydata['shipping_address']['address1']
  var Unit = mydata['shipping_address']['address2']
  var PostalCode = mydata['shipping_address']['zip']
  var ContactNumber = mydata['customer']['phone']
  var Email = mydata['customer']['email']
  var orderId = mydata['id']
  var shippingType = mydata['shipping_lines'][0]['title']
  var date = new Date()
  var day = date.getDay()
  //Code to not have any duplicate webhook
  //Check if the orderID or current webhook notification == the previous row's orderID. If yes, break the code.
  if  (orderId == openSheet.getRange(openSheet.getLastRow(), 8).getValue()){
    return
  }
  //Delivery date setting for wow orders
  if (shippingType == wowType){
    if (day < 4 && day > 0 ){ //2 Scheduled days of deliveries. Wed or Fri. Thurs-Sun: Wed / Mon-Wed: Friday
      var daydiff = 5 - day 
      date.setDate(date.getDate() + daydiff)
    }
    else if (day ==0) {
      var daydiff = 3
      date.setDate(date.getDate() + daydiff)
    }
    else {
      var daydiff = 3 - day + 7
      date.setDate(date.getDate() + daydiff)
    };
  }
  //Delivery date setting for Self-collect
  else{
    if (day == 6){
      date.setDate(date.getDate() + 2)
    }
    else {
      date.setDate(date.getDate() + 1)
    };
  };
  //delivery time slot from 10:00 - 18:00 for creation in Versafleet
  var start_time = '10:00'
  var end_time = '18:00'
  var tags = 'apparel_resale'
  var guid = openSheet.getRange(nextEmptyRow, 7) //Range to place the GUID of created task in as record
 
  openSheet.getRange(nextEmptyRow, 1).setValue(FullName)
  openSheet.getRange(nextEmptyRow, 2).setValue(AddressLine)
  openSheet.getRange(nextEmptyRow, 3).setValue(Unit)
  openSheet.getRange(nextEmptyRow, 4).setValue(PostalCode)
  openSheet.getRange(nextEmptyRow, 5).setValue(start_time + ' - ' + end_time)
  openSheet.getRange(nextEmptyRow, 6).setValue(date)
  openSheet.getRange(nextEmptyRow, 8).setValue(orderId)
  openSheet.getRange(nextEmptyRow, 9).setValue(shippingType)
  
  if (shippingType == wowType){
  jobcheck(date,Type,FullName,ContactNumber,Email,AddressLine,Unit,PostalCode,start_time,end_time,tags,guid)
  }
}
