//Code to clean and format the data pulled from DailyGet() function into presentable formats in Google Sheet

function Calculation(){
  var date = new Date()
  var day = date.getDay()
  //Don't run the script on Mondays
  if (day == 1){
    return
  };
  var driverlistsheet = ss.getSheetByName('Driver List');
  var datasheet = ss.getSheetByName('VF Data');
  var listlastrow = driverlistsheet.getLastRow();
  for (i=2;i<listlastrow+1;i++){
    var drivername = driverlistsheet.getRange(i, 1).getValue()
    //Create new driver sheet if its not created yet with the basic headers
    if (ss.getSheetByName(drivername) == null){
      ss.insertSheet().setName(drivername)
      var driversheet = ss.getSheetByName(drivername)
      driversheet.getRange(1, 2).setValue(drivername)
      driversheet.getRange(2, 1).setValue('Date')
      driversheet.getRange(2, 2).setValue('1st Task Completion Time')
      driversheet.getRange(2, 3).setValue('Number of 10-2 Tasks')
      driversheet.getRange(2, 4).setValue('Number of 10-2 Tasks Completed By 2pm')
      driversheet.getRange(2, 5).setValue('Number of Tasks Completed Before Time Slot')
      driversheet.getRange(2, 6).setValue('Number of Tasks Completed After Time Slot')
      driversheet.getRange(2, 7).setValue('Number of Tasks')
      driversheet.getRange("A:G").setHorizontalAlignment("center")
      
    }
    var driversheet = ss.getSheetByName(drivername)
    var yesterday = Utilities.formatDate(new Date(date.getTime() - (1000*60*60*24)), 'Asia/Singapore', 'yyyy-MM-dd');
    var lastrow = driversheet.getLastRow()
    driversheet.getRange(lastrow+1, 1).setValue(yesterday)
    driversheet.getRange(lastrow+1, 2).setFormula("=MIN(FILTER('VF Data'!G:G,'VF Data'!C:C=\""+drivername+"\"))");
    driversheet.getRange(lastrow+1, 3).setFormula("=COUNTIFS('VF Data'!C:C,\""+drivername+"\",'VF Data'!D:D,\"10:00-14:00\")");
    driversheet.getRange(lastrow+1, 4).setFormula("=COUNTIFS('VF Data'!C:C,\""+drivername+"\",'VF Data'!D:D,\"10:00-14:00\",'VF Data'!G:G,\"<0.5833333\")");
    driversheet.getRange(lastrow+1, 5).setFormula("=COUNTIFS('VF Data'!C:C,\""+drivername+"\",'VF Data'!E:E,\"10:00\",'VF Data'!G:G,\"<0.4166667\")+COUNTIFS('VF Data'!C:C,\""+drivername+"\",'VF Data'!E:E,\"14:00\",'VF Data'!G:G,\"<0.583333\")+COUNTIFS('VF Data'!C:C,\""+drivername+"\",'VF Data'!E:E,\"18:00\",'VF Data'!G:G,\"<0.75\")");
    driversheet.getRange(lastrow+1, 6).setFormula("=COUNTIFS('VF Data'!C:C,\""+drivername+"\",'VF Data'!F:F,\"14:00\",'VF Data'!G:G,\">0.583333\")+COUNTIFS('VF Data'!C:C,\""+drivername+"\",'VF Data'!F:F,\"18:00\",'VF Data'!G:G,\">0.75\")+COUNTIFS('VF Data'!C:C,\""+drivername+"\",'VF Data'!F:F,\"22:00\",'VF Data'!G:G,\">0.916666\")");
    driversheet.getRange(lastrow+1, 7).setFormula("=COUNTIF('VF Data'!C:C,\""+drivername+"\")");
    //Eliminate any blank rows. Clear the new row if there are no tasks for the drivers.
    if (driversheet.getRange(lastrow + 1, 7).getValue() == 0){
      driversheet.getRange(lastrow + 1, 1,1,7).clear()
    }
    else{
      var copy = driversheet.getRange(lastrow+1, 1,1,7).getValues()
      driversheet.getRange(lastrow+1, 1,1,7).setValues(copy)
      driversheet.getRange(lastrow+1, 2).setNumberFormat("h:mm")
      driversheet.autoResizeColumns(1, 7)
    }
  }
}
