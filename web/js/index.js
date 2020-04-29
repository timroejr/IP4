// JavaScript Document

//$(document).ready( function() {
//	$("#clientTable").DataTable();
//});

function init() {
	
	jQuery.get("/client", function(data, status) {
		console.log(data);
		for (var i = 0; i < data.length; i++) {
			var tmp = data[i];
			$("#clientTables").append("<tr><th scope='row'>" + tmp.clientname + "</th><td>" + tmp.businessname + "</td><td>" + tmp.address + "</td><td>" + tmp.city + "</td><td>" + tmp.state + "</td><td>" + tmp.zip + "</td><td><button type='button' class='btn btn-primary' onClick='openClient(this);' id='" + tmp.businessid + "'>Open Client</button></tr>");
		}
	});
	
}