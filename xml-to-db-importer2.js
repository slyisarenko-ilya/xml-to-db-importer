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
	"/home/intense/temp/nodejs-904964/ndsList.xml",
//	"/home/intense/temp/nodejs-904964/currencyList.xml",
//	"/home/intense/temp/nodejs-904964/detailList.xml",
	"/home/intense/temp/files/nodejs-904964/data/categories.xml"
];

var tagHandlers = [];

/*
 * Структура attrs выглядит примерно так: 
 * 
 [ 'categoryType.name': 'Товары',
  'categoryType.code': 'Товары',
  'categoryType.id': '1',
  'categoryType.isLeaf': 'false',
  'category.name': 'Материалы для живописи и графики',
  'category.code': 'Товары/Товары для творчества/Материалы для живописи и графики',
  'category.id': '1100036',
  'category.parentId': '1100033',
  'category.isLeaf': 'true',
  'detail.name': 'Вид товаров',
  'detail.code': 'Вид товаров',
  'detail.id': '1100913',
  'detail.isRange': 'false',
  'detail.isLevelDefine': 'false',
  'detail.isObligatory': 'true',
  'detail.type': 'list',
  'stringValue.text': 'Товары для творчества' ]
 */
var generator = 0;
tagHandlers["categoryType"] = {
	fn: function(node, baseNode, attrs){ //этот обработчик будет вызываться для каждого узла дерева xml. 
		                 //атрибуты - список всех атрибутов текущего узла, а также атрибутов всех узлов-предков.
		if(node.name() == 'categoryType'){
			return [{
				'table': 'categoryList',
				'fields':["id", "code", "parentId", "kpgzid", "name"],
				'values': [generator++, attrs["categoryType.code"], "-1", "-1", attrs["categoryType.name"]]
			}];
			return insertionData;
		}
		if(node.name() == 'stringValue'){
			return [{
				'table': 'stringValue',
				'fields':['id','name','type','categoryId'],
				'values': [generator++, attrs['stringValue.text'], attrs['detail.type'], attrs['categoryType.id']]
			}];
		}
	}
};

tagHandlers["ndsType"] = {
		fn: function(node, baseNode, attrs){ //этот обработчик будет вызываться для каждого узла дерева xml. 
			                 //атрибуты - список всех атрибутов текущего узла, а также атрибутов всех узлов-предков.

			if(node.name() == 'ndsType'){
				return [{
					'table': 'ndsList',
					'fields':["id", "code",  "name"],
					'values': [attrs["ndsType.id"], attrs["ndsType.code"], attrs["ndsType.name"]]
				}];
				return insertionData;
			}
		}
	};

function clearTable(tableName){
	var sql = "DELETE FROM " + tableName;
	con.query(sql, function (err, result) {
	      if (err) throw err;
	      console.log("Table " + tableName + " cleared.");
	});
}

function clearTables(tables){
	for(var i = 0; i < tables.length; i++){
		var table = tables[i];
		clearTable(table);
	}
}


function handleNode(node, baseNode, attributes){ 
	
	var handler = tagHandlers[baseNode.name()];
	if(handler){
		var insertionData = handler.fn(node, baseNode, attributes);
		if(insertionData){
			for(var i = 0; i < insertionData.length; i++){
				var insertion = insertionData[i];
				var tableName = insertion.table;
				
				var sql = "INSERT INTO " + tableName + " ";
				var fieldsPart = "(";
				var valuesPart = "(";
				var first = true;
				for(var k = 0; k < insertion.fields.length; k++){
					var field = insertion.fields[k];
					var value = insertion.values[k];
		
					var comma = first?'':',';
					fieldsPart += comma + field ;
					valuesPart +=  comma + '"' + jsStringEscape(value) + '"'; 
					first = false;
				}
				fieldsPart += ")";
				valuesPart += ")";
				
				sql += fieldsPart + " VALUES " + valuesPart;
				console.log(sql);
			    con.query(sql, function (err, result) {
			      if (err) 
			    	  console.log(err)
			      else
			    	  console.log(sql + ". Inserted " + result.affectedRows);
			    });
			}
		}
	}

}

/*children, exclude text nodes*/
function childElements(node){
	var result = [];
	var chldrn = node.childNodes();
	for(var i = 0; i < chldrn.length; i++){
		var node = chldrn[i];
		if(node.name() != 'text'){
			result.push(node);
		}
	}
	return result;
}


function normalizeAttributes(node){
	var nodeName = node.name();
	var attributes = node.attrs();
	var result = [];
	for(var i = 0; i < attributes.length; i++){
		var attr = attributes[i];
		result[nodeName+"."+attr.name()] = attr.value();
	}
	return result;
}

function mergeAr(ar1, ar2){
	var result = [];
	for (var attr in ar1) { result[attr] = ar1[attr]; }
	for (var attr in ar2) { result[attr] = ar2[attr]; }
	return result;
}

function traverseChildren(node, rootNode, attributes){
	var normalizedAttributes = normalizeAttributes(node);
	var mergedAttributes = mergeAr(attributes,normalizedAttributes);
	
	var children = childElements(node);
	
	if(children.length == 0){ //leaf node
		//then get text value from them
		var textObj = [];
		textObj[node.name()+".text"] = node.text(); 
		mergedAttributes = mergeAr(mergedAttributes,textObj);
	}
	handleNode(node, (rootNode == null?node: rootNode), mergedAttributes);
	
	if(children.length > 0 ){
		for(var i = 0; i < children.length; i ++){
			var child = children[i];
			var baseNode = rootNode==null?child:rootNode;
			traverseChildren(child, baseNode, mergedAttributes);
		}
	} 
}
	
 
function handleXml(sourceUrl){
	fs.readFile(sourceUrl, 'utf8', function(err, xml) {
		var xmlDoc = libxml.parseXmlString(xml);
		traverseChildren(xmlDoc.root(),null, []);
	});
}
	

con.connect(function(err) {
  if (err) throw err;
  clearTables(["categoryList", "stringValue", 'ndsList']);
  
  sourceUrls.forEach(function(sourceUrl) {
	 handleXml(sourceUrl);
  });
 	  
});
