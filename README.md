# xml-to-db-importer

Скрипты nodejs позволяют выполнять разбор и загрузку в БД MySQL xml-файлов произвольной структуры. xml-to-db-importer2.js содержить функциональные обработчики узлов в порядке обхода дерева xml, что позволяет включить произвольную логику в процесс вставки. 

Для конфигурирования скрипта нужно реализовать только tagHandler для соответствующих тегов первого уровня. Алгоритм будет обходить все дочерние узлы указанных элементов и вызывать для каждого из них обработчик, который должен вернуть массив конфигураций для вставки: имя таблицы, набор полей, набор значений. 


**file-loader.js** - берёт файлы по указанным url (sourceUrls)  и сохраняет в указанной директории(targetDirectory) на сервере/локальной машине.


Скрипты **xml-to-db-importerX.js** делают одно и тоже, но разными способами: разбирают xml-файл и сохраняет их в таблицах MySql по простому соответствию полей. Предусмотрена возможность указать значения по-умолчанию. 

**xml-to-db-importer.js** - конфигурируются при помощи массивов вида 
```javascript
tableTags['detailType'] = {table: "detailList",
		attributes: ["id", "name", "code", "isRange", "type", "isLevelDefine", "isObligatory", "categoryId"],
		fields:     ["id", "name", "code", "isRange", "type", "isLevelDefine", "isObligatory", "categoryId"],
		defaults:["-1", "",    "",      "true",    "" ,        "",              "",          "-1"]};
```

**xml-to-db-importer2.js** - конфигурируются при помощи обработчиков вида
```javascript
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
```

При вставке в БД пока просто экранируются двойные кавычки. В плане использовать query builder. 


! Внизу скрипта находится код предварительной очистки таблиц.
