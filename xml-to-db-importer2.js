/**
 * Parse xml files and import them into database 
 * Allow handle only first-level xml-data. 
 * Need do work for more complex xml. Multilevel.
 */
var libxml = require('libxmljs');
var fs = require('fs');
var mysql = require('mysql');
var jsStringEscape = require('js-string-escape');

var con = mysql.createConnection({
	  host: "localhost",
	  user: "testuser",
	  password: "testuser",
	  database: "testdb"
	});

var sourceUrls = [
//	"/home/intense/temp/nodejs-904964/kpgzList.xml",
//	"/home/intense/temp/nodejs-904964/categoryList.xml",
//	"/home/intense/temp/nodejs-904964/tagList.xml",
//	"/home/intense/temp/nodejs-904964/okeiList.xml",
//	"/home/intense/temp/nodejs-904964/packageList.xml",
//	"/home/intense/temp/nodejs-904964/ndsList.xml",
//	"/home/intense/temp/nodejs-904964/currencyList.xml",
//	"/home/intense/temp/nodejs-904964/detailList.xml",
	"/home/intense/temp/nodejs-904964/category_1_1.xml"
];


var tagHandlers = [];
tagHandlers["ndsType"] = {
	table: 'ndsList',
	fn: function(node, attrs){
		var data = [];
		for(var i = 0; i < attrs.length; i++){
			data[attrs[i].name()] = attrs[i].value();
		}
		//add default values if need
		return data;
	  }
};


tagHandlers["detailType"] = {
		table: 'detailList',
		fn: function(node, attrs){
			var data = [];
			for(var i = 0; i < attrs.length; i++){
				data[attrs[i].name()] = attrs[i].value();
			}
			//TODO: Default values too complex for initialization. Need do better.
			if(!data["isRange"]){
				data['isRange'] = false;
			};
			if(!data["type"]){
				data['type'] = 'text';
			};
			if(!data["isLevelDefine"]){
				data['isLevelDefine'] = false;
			};
			if(!data["isObligatory"]){
				data['isObligatory'] = false;
			};
			if(!data["categoryId"]){
				data['categoryId'] = -1;
			};
			return data;
		  }
	};


tagHandlers["categoryType"] = {
		table: 'ndsList',
		fn: function(node, attrs){
			var data = [];
			for(var i = 0; i < attrs.length; i++){
				data[attrs[i].name()] = attrs[i].value();
			}
			//add default values if need
			return data;
		  }
	};


function clearTable(tableName){
	var sql = "DELETE FROM " + tableName;
	console.log(sql);
	con.query(sql, function (err, result) {
	      if (err) throw err;
	      console.log("Table " + tableName + " cleared.");
	});
}
 
function clearTables(){
	for(var index in tagHandlers){
		var tableName = tagHandlers[index].table;
		clearTable(tableName);
	}
}

function handleNode(node){
	var handler = tagHandlers[node.name()];
	//var tableData = tableTags[node.name()];
	if(handler){
		var attributes = node.attrs();
		var handlerResult = handler.fn(node, attributes);
//		console.log(handlerResult);
		var tableName = handler.table;
		
		var sql = "INSERT INTO " + tableName + " ";
		var fieldsPart = "(";
		var valuesPart = "(";
		var first = true;
		for(var k in handlerResult){
			
			var fieldName = k;
			var value = handlerResult[k];

			var comma = first?'':',';
			fieldsPart += comma + fieldName ;
			valuesPart +=  comma + '"' + jsStringEscape(value) + '"'; 
			first = false;
		}
		fieldsPart += ")";
		valuesPart += ")";
		
		sql += fieldsPart + " VALUES " + valuesPart;
	    con.query(sql, function (err, result) {
	      if (err) 
	    	  console.log(err)
	      else
	    	  console.log(sql + ". Inserted " + result.affectedRows);
	    });
	}

}

function traverseChildren(node){
	console.log(node);
	var children = xmlDoc.root().childNodes();
	if(children.length > 0 ){
		for(var i = 0; i < children.length; i ++){
			var node = children[i];
			traverseChildren(node);
			//handleNode(node);
		}
	} else{ //is leaf node
		
	}
}
	
 
function handleXml(sourceUrl){
	fs.readFile(sourceUrl, 'utf8', function(err, xml) {
		var xmlDoc = libxml.parseXmlString(xml);
		traverseChildren(xmlDoc.root());
	});
}
	

con.connect(function(err) {
  if (err) throw err;
  clearTables();
  
  sourceUrls.forEach(function(sourceUrl) {
	 handleXml(sourceUrl);
  });
 	  
});
