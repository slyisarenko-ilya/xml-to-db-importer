/**
 * Загрузить файлы и положить в указанную директорию (она должна существовать) 
 */


var request = require('request');
var fs = require('fs');
var path = require('path');
var url = require("url");

var sourceUrls = [
	"http://liquid-crystal.ru/files/904964/categoryList.xml",
	"http://liquid-crystal.ru/files/904964/kpgzList.xml",
	"http://liquid-crystal.ru/files/904964/tagList.xml",
	"http://liquid-crystal.ru/files/904964/okeiList.xml",
	"http://liquid-crystal.ru/files/904964/packageList.xml",
	"http://liquid-crystal.ru/files/904964/ndsList.xml",
	"http://liquid-crystal.ru/files/904964/category_1_1.xml",
	"http://liquid-crystal.ru/files/904964/detailList.xml",
	"http://liquid-crystal.ru/files/904964/currencyList.xml"
];

var targetDirectory = "/home/intense/temp/nodejs-904964/";

sourceUrls.forEach(function(sourceUrl) { 
	request(sourceUrl, function (error, response, content) {
		if(response && response.statusCode && response.statusCode == 200){
			//создать файлы с такими же именами на диске и записать их содержимое
			
			var parsed = url.parse(sourceUrl);
			var fileName = path.basename(parsed.pathname);
			console.log(fileName);
			
			var targetFile = targetDirectory + fileName;
			fs.open(targetFile, 'wx', (err, fd) => {
				if (err) {
				    if (err.code === 'EEXIST') {
						console.error('myfile already exists');
						return;
				    }
				    throw err;
				}
				fs.writeFile(targetFile, content, function(err) {
				    if(err) {
				        return console.log(err);
				    }
				    console.log("The file " + targetFile + " was saved!");
				}); 
			});
		} else{
			  console.log('error:', error); // Print the error if one occurred
			  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		}
	});	
});

