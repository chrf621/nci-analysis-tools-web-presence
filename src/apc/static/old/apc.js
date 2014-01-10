var error_reason;
var paste_instructions = 
	"When pasting from a spreadsheet or uploading from a csv file,\n it should have alternating " +
	"columns of count-then-population\n" +
	"for at least two age periods (minimum size array = 2x2),\n no more than 100 age groups and periods.";
var line_array; // This is global.  Not set until a paste or upload

$(document).ready(function() { 

		periodRRData = "[ { \"Period\":   1995,\"Rate\": 112.35,\"CILo\": 109.96,\"CIHi\": 114.78 },{ \"Period\":   1999,\"Rate\": 124.56,\"CILo\": 122.18,\"CIHi\": 126.99 },{ \"Period\":   2003,\"Rate\": 123.37,\"CILo\": 121.06,\"CIHi\": 125.72 },{ \"Period\":   2007,\"Rate\": 136.51,\"CILo\": 134.11,\"CIHi\": 138.96 } ]";

		var periodRRData2d = JSON.parse(periodRRData)
		//jQuery('#periodRR').dataTable().fnDestroy(); // **please note this**
		$('#periodRR').dataTable( {
	        "aaData": periodRRData2d,
    		"aoColumns": [
        		{ "mDataProp": "Period" },
        		{ "mDataProp": "Rate" },
        		{ "mDataProp": "CILo" },
        		{ "mDataProp": "CIHi" }
    		]
    	});    
	// var oTable = $('#periodRR').dataTable( {
	// 	"bProcessing": true,
	// 	"aaData": periodRRData2d,
	// 	"aoColumns": [
 //            { "mData": "Period" },
 //            { "mData": "Rate Ratio" },
 //            { "mData": "CILo" },
 //            { "mData": "CIHi" }
 //        ]
	// });

	$( "#R_upload_button" ).click(function() {
		alert("Coming Soon");
	});
	$( "#csv_upload_button" ).click(function() {
		alert("Coming Soon");
	});
	getDefaultValues();
	create_paste_binding($(".paste_area"));
	getGoogleData();
	
	$( "#calculate" ).click(function() {

  //   	var title = encodeURIComponent($("#title").val());
    
  //    	var startYear = $("#startYear").val();
  //    	var startAge = $("#startAge").val();
  //    	var interval =$("#interval").val();
  //    	var periodCount= numberOfPeriods();
  //    	var rowCount = numberOfRows();
  //    	var countCSV = encodeURIComponent(determine_count_array());
  //    	var populationCSV = encodeURIComponent(determine_pop_array());
	
		// var url = "sulasPythonToRGoesHere.py?title=" + title + 
		// "&startYear="+startYear +
		// "&startAge="+startAge + 
		// "&interval="+interval +
		// "&periodCount="+periodCount +
		// "&rowCount="+rowCount +
		// "&countCSV="+countCSV +
		// "&populationCSV="+populationCSV;
		// alert(url);
		
	});
	// TODO: Sula add this commented out code to the function above to do a GET
	// Hasn't been tested so may require a little debugging as I am not sure I can have
	// variables the same name as the value example startAge: startAge
    	// $.get(
    	// 	"sulasPythonToRGoesHere.php", {
    	// 		title : 	title, 
    	// 		startYear : startYear,
    	// 		startAge :  startAge,
    	// 		interval :  interval,
    	// 		periodCount : periodCount,
    	// 		rowCount : rowCount,
    	// 		countCSV : countCSV,
    	// 		populationCSV : populationCSV
    	// 	}, 
    	// 	function(data) {
    	// 		alert('page content: ' + data);
    	// 	}
//);
    //});
    
	$( "#startAge" ).change(function() {
		on_change_starting_age();		
	});

	$( "#title" ).change(function() {
		display_table(text);
	});

	$( "#startYear" ).change(function() {
		on_change_start_year();
	});

	$( "#interval" ).change(function() {
		on_change_starting_age();
		on_change_start_year();
	});

	$( "#loadExampleData" ).click(function() {
		// TODO: send data to Larry's code somehow
	});

	$( "#countPopulation" ).bind("change",function() {
		upload_file();
	});

	// $( "#countPopulation" ).bind("changefileupload(function() {
	// 	upload_file();
	// });

});

function getDefaultValues () {
	var defaultValuesQuery = 'https://spreadsheets.google.com/feeds/list/0AiA747YDxiD1dFc4czdRWElBdzl1ZTdQYVU1WE9UbFE/od6/public/values?alt=json';

	$.getJSON(defaultValuesQuery, function(defaultValues) {
		var defaultTitle 		= defaultValues.feed.entry[0].gsx$title.$t;
		var defaultStartYear 	= defaultValues.feed.entry[0].gsx$startyear.$t;
		var defaultStartAge 	= defaultValues.feed.entry[0].gsx$startage.$t;
		var defaultInterval 	= defaultValues.feed.entry[0].gsx$interval.$t;

		$("#title").value = defaultTitle;
		$("#startYear").value = defaultStartYear;
		$("#startAge").value = defaultStartAge;
		//$("#interval").value = defaultInterval;
	});
}
function getGoogleData () {
	var exampleDataSpreadsheetQuery = 'https://spreadsheets.google.com/feeds/list/0AiA747YDxiD1dFRfSlNudmRSY3Y5b2dOYXBNbjdLNmc/od6/public/values?alt=json';
	// Load an entire sheet.

	$.getJSON(exampleDataSpreadsheetQuery, function(exampleData) {
		var value;
		for (var i = 0; i < exampleData.feed.entry.length; i++) {
			var newTableRow = '<tr>';
			var allColumnNames = Object.keys(exampleData.feed.entry[i]);
			// First I have to figure out what the columns are called
			for (var j=0; j < allColumnNames.length; j++) {
				if ((allColumnNames[j].indexOf("gsx$count") > -1) || (allColumnNames[j].indexOf("gsx$population") > -1)) {
					value = exampleData.feed.entry[i][allColumnNames[j]];
					newTableRow = newTableRow + '<td>'+ value.$t + '</td>';
				} 
			}
			newTableRow = newTableRow + '</tr>';
			$("#exampleData-table").append(newTableRow);
		}
	});
}
 
function upload_file() {
//	var file = document.getElementById('files').files[0];
	var files_element = document.getElementById('files');
	var files = files_element.files;
	
	if (!files|| !files.length) {
		alert('Please select a file!');
		return;
	}

	var file = files[0];
	var reader = new FileReader();

	// If we use onloadend, we need to check the readyState.
	reader.onload = function(evt) {
		if (evt.target.readyState == FileReader.DONE) { // DONE == 2
			parse_file(evt.target.result);
		}
	};

	var blob = file.slice(0, file.size);
	reader.readAsBinaryString(blob);
}

function parse_file(blob) {
	var text = blob.replace(/,/g,'\t');	
	display_table(text);
}

function create_paste_binding (element) {
    element.bind('paste', function(e)  {
        var self = this;
        $(this).val("");
        setTimeout(function(e) {
        	var txt = $(self).val();
        	var status = display_table(txt);
            if (status) $("#paste_area").val("Input Pasted");
            else $("#paste_area").val("Input Failed \nneeds to be 14,9");
        }, 0);          
     });	 
}

function on_change_starting_age() {
	if (line_array == null) return;
	
	var starting_age = parseInt($("#startAge").val());
	
	var num_ages = line_array.length - 1;
	for (var y=0;y<num_ages;y++) {
		$("#age_" + y).html(compute_age(y));
	}
}

function getInterval (){
	var intervalString = $("#interval").val();
	var interval = 4; // 4 is the default
	switch (intervalString) {
		case "year1":
			interval = 1;
		break;
		case "year2":
			interval = 2;
		break;
		case "year3":
			interval = 3;
		break;
		case "year4":
			interval = 4;
		break;
		case "year5":
			interval = 5;
		break;
	}
	return interval;
}

function on_change_start_year() {
	if (line_array == null) return;
	
	var first_period = parseInt($("#startYear").val());
	
	var num_periods = Math.floor((line_array[0].length + 1) / 2);
	for (var x=0;x<num_periods;x++) {
		var period_start = compute_period(x);
		var period_end = period_start + getInterval() - 1;

		// When start and end are both is same year, just display it once
		var period_display;
		if (period_start == period_end) period_display = period_start;
		else period_display = period_start +  " - " + period_end;

		$("#period_" + x).html(period_display);
	}
}

function determine_count_array() {
	
	var num_periods = numberOfPeriods();
	var num_ages = numberOfRows();
	
	var counts = "";
	for (var y=0;y<num_ages;y++) {
		for (var x=0;x<num_periods;x++) {
			counts += line_array[y][(x*2)] + ',';
		}
	}
	return counts;
}

function determine_pop_array() {

	var num_periods = numberOfPeriods();
	var num_ages = numberOfRows();
	
	var pop_array = "";
	for (var y=0;y<num_ages;y++) {
		for (var x=0;x<num_periods;x++) {
			pop_array += line_array[y][((x*2)+1)] + ',';
		}
	}
	return pop_array;	
}

function numberOfPeriods () {
	return Math.floor((line_array[0].length + 1) / 2);
}

function numberOfRows () {
	return line_array.length - 1;
}
// function determine_combined_array() {

// 	var num_periods = Math.floor((line_array[0].length + 1) / 2);
// 	var num_ages = line_array.length - 1;
	
// 	var combo_str = ""; // Must set this to empty otherwise it will add "udefined" to [0][0] cell
// 	for (var x=0;x<num_periods;x++) {
// 		for (var y=0;y<num_ages;y++) {
// 			combo_str += line_array[(y*2)][x] + "," + line_array[(y*2)+1][x];
// 		}
// 		combo_str +="\n";
// 	}
// 	return combo_str;	
// }

function display_table(txt) {
	var lines = txt.split("\n");
	line_array = new Array(lines.length);
	for (count = 0; count < lines.length;count++) {
		line_array[count] = lines[count].split("\t");
	}
	
	// Check for all conditions in which data size is wrong
	if (!validate_paste_input(line_array)) {
		alert(error_reason + "\n\n" + paste_instructions);
		return false;
	}
	
	var rows = lines.length - 1;
	// Note each 'col' is actually 2 columns in the data and tables
	var cols = Math.floor((line_array[0].length + 1) / 2);
		
	// We are going to completely replace this table with a new one of the appropriate size

	$("#main-table").empty();
	
	var first_header_row = $("<tr></tr>");
	first_header_row.append("<th>&nbsp;</th>");
	first_header_row.append("<th>&nbsp;</th>");
	for (var x =0; x < cols; x++) {
		var cell = $("<th colspan='2' class='header border-top'><u>Calendar Period " + (x+1) + "</u></th>");
		// Add left and right borders as required
		if (x == 0) cell.addClass("border-left");
		else if (x == cols-1) cell.addClass("border-dotted-left").addClass("border-right");
		else cell.addClass("border-dotted-left");
		first_header_row.append(cell);			
	}
	$("#main-table").append(first_header_row);

	var second_header_row = $("<tr></tr>");
	second_header_row.append("<th></th>");
	second_header_row.append("<th class='header border-bottom'></th>");
	
	for (var x =0; x < cols; x++) {
		var cell_left = $("<th class='header border-bottom'>Count</th>");
		if (x == 0) cell_left.addClass("border-left");
		else cell_left.addClass("border-dotted-left");
		second_header_row.append(cell_left);
		var cell_right = $("<th class='header border-bottom'>Population</th>");
		if (x == cols-1) cell_right.addClass("border-right");
		second_header_row.append(cell_right);
	}
	$("#main-table").append(second_header_row);
	
	var third_header_row = $("<tr></tr>");
	third_header_row.append("<td >&nbsp;</td>");
	third_header_row.append("<td class='header border-dotted-bottom border-left border-top'>&nbsp;</td>");
	var table_title = $("<td id='table-title' colspan='" + (cols * 2) + "' class='header border-dotted-bottom border-right border-dotted-left  border-top'>" + $("#title").val() + "</td>");
	table_title.click(function() {
		click_to_change_title();
	});

	third_header_row.append(table_title);
	
	$("#main-table").append(third_header_row);
	
	var fourth_header_row = $("<tr></tr>");
	fourth_header_row.append("<th></th>");
	fourth_header_row.append("<td class='header border-left'></th>");
	for (var x =0; x < cols; x++) {
// 		var cell_left = $("<td class='data border-dotted-left' id='Period_" + x + "_count'>" + compute_period(x) + "</th>");
//		fourth_header_row.append(cell_left);
//		var cell_right = $("<td class='data' id='Period_" + x + "_pop'>" + compute_period(x) + "</th>");
//		fourth_header_row.append(cell_right);
//		if (x == cols - 1) cell_right.addClass("border-right");
		var period_start = compute_period(x);
		var period_end = period_start + getInterval() - 1;
		
		// When start and end are both is same year, just display it once
		var period_display;
		if (period_start == period_end) period_display = period_start;
		else period_display = period_start +  " - " + period_end;

		var cell = $("<td colspan='2' class='header border-dotted-left' id='period_" + x + "'>" + 
				period_display +  "</th>");
		fourth_header_row.append(cell);
		if (x == cols - 1) cell.addClass("border-right");

	}
	$("#main-table").append(fourth_header_row);

	var fifth_header_row = $("<tr></tr>");
	fifth_header_row.append("<th></th>");
	fifth_header_row.append("<td class='header border-bottom border-left'>Age</th>");
	for (var x =0; x < cols; x++) {
		var cell_left = $("<td class='header border-bottom border-dotted-left'>Count</th>");
		fifth_header_row.append(cell_left);
		var cell_right = $("<td class='header border-bottom'>Population</th>");
		fifth_header_row.append(cell_right);
		if (x == cols - 1) cell_right.addClass("border-right");
	}
	$("#main-table").append(fifth_header_row);

	////  Main Data Element
	for (var y=0; y < rows; y++) {
		var data_row = $("<tr></tr>");
		// First Column is label, because of rowspan, only first row has it
		if (y == 0) data_row.append("<td id='row-title' rowspan='" + rows + "' class='header vertical-text border-top border-bottom border-left'>" +
				"Age at Diagnosis<br/><i>(" + rows + " Age Groups)</i></td>")
		
		var age_cell = $("<td id='age_" + y + "' class='header border-left'>" + compute_age(y) + "</td>");
				
		if (y == rows - 1) age_cell.addClass("border-bottom");
		data_row.append(age_cell);
		for (var x=0; x<cols;x++) {
			var count_value = line_array[y][2*x];
			var population_value = line_array[y][2*x+1];
			
			var cell = $("<td  class='data border-dotted-left'> " + addCommas(count_value) + "</td>");
			cell.attr("id", "D_" + y + "_" + x + "_count");
			if (y == rows-1 ) cell.addClass("border-bottom");
			
			data_row.append(cell);
			var cell = $("<td class='data'> " + addCommas(population_value) + "</td>");
			if (y == rows-1 ) cell.addClass("border-bottom");
			if (x == cols-1 ) cell.addClass("border-right");
			cell.attr("id", "D_" + y + "_" + x + "_pop");
			
			data_row.append(cell);
		}
		$("#main-table").append(data_row);
	}
	
	// Ok, now we built the whole table.  We need to find out exactly where and how big the data area is for the 
	// Invisible paste-box

	var total_width = $("#table-title").outerWidth();
	var total_height = $("#row-title").outerHeight();
		
	var offset = $("#D_0_0_count").offset();
	
	var paste_area_box = $("<textarea></textarea>");
	paste_area_box.addClass("paste_area");
	paste_area_box.css("height", total_height);
	paste_area_box.css("width", total_width);
	paste_area_box.css("left", offset.left);
	paste_area_box.css("top", offset.top);
	paste_area_box.css("filter", "alpha(opacity = 00)");
	paste_area_box.css("opacity", "0.0");
	
	create_paste_binding(paste_area_box);
	
	$("#D_0_0_count").prepend(paste_area_box);
	
	return true;
}

function compute_age (num) {
	var starting_age = parseInt($("#startAge").val());
	var interval = getInterval();//parseInt($("#interval").val());
	
//	alert ("["+starting_age+"]["+interval+"]")
	return starting_age + (num * interval);
}

function compute_period(num) {
	var first_period = parseInt($("#startYear").val());
	var interval = getInterval();//parseInt($("#interval").val());
	
	return first_period + (num * interval);	
}

// error_reason is a global that provides insight as to why the paste did not work.
function validate_paste_input (line_array) {
	var rows = line_array.length;
	var cols = line_array[0].length;

	if (rows == 0 || cols == 0) { error_reason = "Data is Empty"; return false; }
	if ( (cols % 2) != 0) { error_reason = "Not an even number of columns"; return false; } 
	if (rows < 2)  { error_reason = "Less than 2 rows"; return false; }
	if (cols < 2)  { error_reason = "Less than 2 columns"; return false; }
	if (rows > 100)  { error_reason = "Too many rows (more than 100)"; return false; }
	if (cols > 200)  { error_reason = "Too many columns (more than 200)"; return false; }
	
	// check that all numbers are really numbers
	var rows = line_array.length;
	// Note each 'col' is actually 2 columns in the data and tables
	var cols = Math.floor((line_array[0].length + 1) / 2);

	var all_numbers = true;
	var bad_values = "";
	var num_errors=0;
	for (var y=0; y < rows-1; y++) {
		for (var x=0; x<cols;x++) {
			var count_value = line_array[y][2*x];
			var population_value = line_array[y][2*x+1];
			
			if (isNaN(count_value)) { 
				all_numbers=false; 
				bad_values += "[" + count_value + "]"; 
				num_errors++;
			}
			if (isNaN(population_value)) { 
				all_numbers=false; 
				bad_values += "["+population_value+"]"; 
				num_errors++;
			}
			// No reason to show too many errors
			if (num_errors >= 5) { error_reason = "At least 5 non-numbers found: " + bad_values; return false; }
	
		}	
	}
	if (!all_numbers) { error_reason = "Some non-numbers found: " + bad_values; return false; }
	
	
	return true;
}

// Number formatter
function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}