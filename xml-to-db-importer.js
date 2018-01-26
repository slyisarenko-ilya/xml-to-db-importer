/**
 * Parse xml files and import them into database 
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


var tableTags = [];
tableTags['kpgzType'] = {
		table:"kpgzList",
		attributes: ["id", "name", "code"],
		fields:["id", "name", "code"]};

tableTags['ndsType'] = {table: "ndsList",
						attributes: ["id", "name", "code"],
						fields:["id", "name", "code"]};
tableTags['tagType'] = {table: "tagList",
		attributes: ["id", "name", "code"],
		fields:["id", "name", "code"]};

tableTags['okeiType'] = {table: "okeiList",
		attributes: ["id", "name", "code"],
		fields:     ["id", "name", "code"]};

tableTags['currencyType'] = {table: "currencyList",
		attributes: ["id", "name", "code"],
		fields:     ["id", "name", "code"]};

tableTags['packageType'] = {table: "packageList",
		attributes: ["id", "name", "code"],
		fields:     ["id", "name", "code"]};

tableTags['categoryType'] = {table: "categoryList",
		attributes: ["id", "name", "code", "kpgzId", "parentId"],
		fields:     ["id", "name", "code","kpgzId",  "parentId"],
		defaults:["-1", "", "","-1",  "-1"]};

tableTags['detailType'] = {table: "detailList",
		attributes: ["id", "name", "code", "isRange", "type", "isLevelDefine", "isObligatory", "categoryId"],
		fields:     ["id", "name", "code", "isRange", "type", "isLevelDefine", "isObligatory", "categoryId"],
		defaults:["-1", "",    "",      "true",    "" ,        "",              "",          "-1"]};


function clearTable(tableName){
	var sql = "DELETE FROM " + tableName;
	console.log(sql);
	con.query(sql, function (err, result) {
	      if (err) throw err;
	      console.log("Table " + tableName + " cleared.");
	});
}

function clearTables(){
	for(var index in tableTags){
		var tableName = tableTags[index].table;
		clearTable(tableName);
	}
}

function handleNode(node, attributes){

	var tableData = tableTags[node.name()];
	if(tableData){
		var tableName = tableData.table;
		
		var sql = "INSERT INTO " + tableName + " ";
		var fieldsPart = "(";
		var valuesPart = "(";
		var first = true;
		for(var k = 0; k < tableData.attributes.length; k++){
			var attrName = tableData.attributes[k];
			var fieldName = tableData.fields[k];
			var defaultValue = tableData['defaults']?tableData.defaults[k]: "";
			var attr = node.attr(attrName);
			if(attr){
				var value = attr.value();
			} else{
				value = defaultValue;
			}

			var comma = first?'':',';
			fieldsPart += comma + fieldName ;
			valuesPart +=  comma + '"' + jsStringEscape(value) + '"'; 
			first = false;
		}
		fieldsPart += ")";
		valuesPart += ")";
		
		sql += fieldsPart + " VALUES " + valuesPart;
//		console.log(sql + " >>>");
	    con.query(sql, function (err, result) {
	      if (err) 
	    	  console.log(err)
	      else
	    	  console.log(sql + ". Inserted " + result.affectedRows);
	    });
	}

}


function handleXml(sourceUrl){
	fs.readFile(sourceUrl, 'utf8', function(err, xml) {
		var xmlDoc = libxml.parseXmlString(xml);
		var children = xmlDoc.root().childNodes();
			for(var i = 0; i < children.length; i ++){
				var node = children[i];
				handleNode(node);
			}
		});
}


con.connect(function(err) {
  if (err) throw err;
  clearTables();
  
  sourceUrls.forEach(function(sourceUrl) {
	 handleXml(sourceUrl);
  });
 	  
});
