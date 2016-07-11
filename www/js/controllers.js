
var db = null;
angular.module('starter.controllers', [])

.controller('CategoriaCtrl', function($ionicPlatform, $scope, $cordovaSQLite, $cordovaToast, $state, $ionicModal, $ionicPopup) {
	$scope.categoria = {};
	$scope.categorias = [];

	$ionicPlatform.ready(function() {
        dbDirectory = cordova.file.applicationStorageDirectory + 'databases';
        db = $cordovaSQLite.openDB({name: "base.db", location: dbDirectory});
    });

	$ionicModal.fromTemplateUrl('edit-categoria-modal.html', {
    	scope: $scope,
      	animation: 'slide-in-up'
  	}).then(function (modal) {
      	$scope.editCategoriaModal = modal;
  	});

    $scope.openEditCategoriaModal = function(id){
    	var query = "select id, descricao from categoria where id = ?";
	    db.transaction(function(transaction) {
	    	transaction.executeSql(query, [id],
	        	function(tx, result) {
	          		if(result.rows.length > 0){
	            		$scope.categoria.id = result.rows.item(0).id;
	            		$scope.categoria.descricao = result.rows.item(0).descricao;
	            		console.log("Achei");
	            		$scope.editCategoriaModal.show();
	          		} else {
	              		console.log("Nao achei");
	          		}
	        	},
	        	function(error){
	          		console.log(error);
	      		}
	      	);
	    });
  	}

  	$scope.closeEditCategoriaModal = function () {
    	$scope.editCategoriaModal.hide();
  	}

	$scope.saveCategoria = function() {
	    var query = "insert into categoria (descricao) values (?)";
	    db.transaction(function(transaction) {
	    	transaction.executeSql(query, [$scope.categoria.descricao],
		        function(tx, result) {
		        	console.log("Categoria Salva!");
		        	
		        	//Para limpar o input dando refresh na view
		          	$scope.categoria = {};
		          	$state.go($state.current, {}, {reload: true});

		          	$cordovaToast.showShortCenter("Categoria cadastrada com sucesso!");
		        },
		        function(error){
		          	console.log("DEU ERRO AO SALVAR: " + error);
		          	$cordovaToast.showShortCenter("Ocorreu um erro!");
		      	}
	      	);
    	});
  	}

  	$scope.updateCategoria = function() {
     	var query = "update categoria set descricao = ? where id = ?";
      	db.transaction(function(transaction) {
        	transaction.executeSql(query, [$scope.categoria.descricao, $scope.categoria.id],
          		function(tx, result) {
	            	$scope.categoria = {};
		            $scope.editCategoriaModal.hide();
		            console.log("Update OK!");
		            $scope.listaCategorias();
	          	},
          		function(error){
            		console.log("Update FAIL!");
        		}
        	);
      	});
  	}

  	//VERIFICAR SE TEM GASTOS PARA A CATEGORIA INFORMADA ANTES DE EXCLUIR E INFORMAR NA MSG
  	$scope.checkToRemove = function(id) {
  		var msg = '';
	    var query = "select * from gasto where categoria = ?";
     	
      	db.transaction(function(transaction) {
        	transaction.executeSql(query, [id],
          		function(tx, result) {
	            	if(result.rows.length > 0){
	                	msg = 'Há gastos cadastrados nessa categoria, deseja excluir a mesma juntamente com os gastos?';
	            	} else{
	            		msg = 'Tem certeza que deseja excluir a categoria?';
	            	}

	            	$scope.removeCategoria(msg, id);
          		}, function(error){
              		console.log("ERRO SQL: " + error);
          		}
          	);
      	});
    }

  	$scope.removeCategoria = function(msg, id) {
  		var query = "";
     	
      	var confirmPopup = $ionicPopup.confirm({
	    	title: 'Alerta',
	    	template: msg,
	    	cancelText: 'Não',
	    	okText: 'Sim'
	    });

	    confirmPopup.then(function(res) {
	    	if(res) {
	       		query = "delete from categoria where id = ?";
		      	db.transaction(function(transaction) {
		        	transaction.executeSql(query, [id],
		          		function(tx, result) {
		        			console.log("Delete OK!");
		        			$scope.listaCategorias();
		        			//Essa linha combinada com a linha '$ionicConfigProvider.views.maxCache(0);' presente no 'app.js' permite atualizar a lista
		        			$state.go($state.current, {categorias: $scope.categorias});
		          		},
		          		function(error){
		            		console.log("Delete FAIL!");
		            		$cordovaToast.showShortCenter("Não foi possível excluir!");
		        		}
		        	);
		      	});
	     	} 
	   	});
  	}

  	$scope.listaCategorias = function () {
  		console.log("RECUPERANDO CATEGORIAS...");
      	$scope.categorias = [];
      	var query = "select id, descricao from categoria order by descricao asc";
      	
      	db.transaction(function(transaction) {
        	transaction.executeSql(query, [],
          		function(tx, result) {
	            	if(result.rows.length > 0){
	                	for(var i = 0; i < result.rows.length; i++) {
	                    	$scope.categorias.push({id: result.rows.item(i).id, descricao: result.rows.item(i).descricao});
	                	}
	                	console.log(result.rows.length + " rows found.");
	                	$state.go($state.current, {categorias: $scope.categorias});
	            	} else {
	                	$scope.categorias = [];
	                	console.log("0 rows found.");
	            	}
          		}, function(error){
              		console.log(error);
          		}
          	);
      	});
  	}

  	$scope.listaCategorias();
})

.controller('GastoCtrl', function($ionicPlatform, $scope, $cordovaSQLite, $cordovaToast, $state, $ionicModal, $ionicPopup) {
	$scope.gasto = {};
    $scope.categorias = [];
    $scope.gastos = [];
    $scope.titulo_relatorio = '';
    $scope.totalCategoria = 0;
    $scope.totalMes = 0;

    $ionicPlatform.ready(function() {
        dbDirectory = cordova.file.applicationStorageDirectory + 'databases';
        db = $cordovaSQLite.openDB({name: "base.db", location: dbDirectory});

        $scope.listaCategorias();
    });

	$scope.anos = [
	    { valor: '2016', id: 2016 }, { valor: '2017', id: 2017 },
	    { valor: '2018', id:2018 }, { valor: '2019', id: 2019},
	    { valor: '2020', id: 2020 }, { valor: '2021', id: 2021 },
	    { valor: '2022', id: 2022 }, { valor: '2023', id: 2023 },
	    { valor: '2024', id: 2024 }, { valor: '2025', id: 2025 },
	    { valor: '2026', id: 2026 }, { valor: '2027', id: 2027}
  	];

	$scope.meses = [
	    { valor: 'Janeiro', id: 1 }, { valor: 'Fevereiro', id: 2 },
	    { valor: 'Março', id: 3 }, { valor: 'Abril', id: 4 },
	    { valor: 'Maio', id: 5 }, { valor: 'Junho', id: 6 },
	    { valor: 'Julho', id: 7 }, { valor: 'Agosto', id: 8 },
	    { valor: 'Setembro', id: 9 }, { valor: 'Outubro', id: 10 },
	    { valor: 'Novembro', id: 11 }, { valor: 'Dezembro', id: 12}
  	];

  	$scope.dias = [
	    { valor: '1', id: 1 }, { valor: '2', id: 2 }, { valor: '3', id: 3 }, 
	    { valor: '4', id: 4 },{ valor: '5', id: 5 },{ valor: '6', id: 6 },
	    { valor: '7', id: 7 }, { valor: '8', id: 8 }, { valor: '9', id: 9 },
	    { valor: '10', id: 10 }, { valor: '11', id: 11 }, { valor: '12', id: 12},
	    { valor: '13', id: 13}, { valor: '14', id: 14}, { valor: '15', id: 15},
	    { valor: '16', id: 16}, { valor: '17', id: 17}, { valor: '18', id: 18},
	    { valor: '19', id: 19 }, { valor: '20', id: 20 }, { valor: '21', id: 21},
	    { valor: '22', id: 22}, { valor: '23', id: 23}, { valor: '24', id: 24},
	    { valor: '25', id: 25}, { valor: '26', id: 26}, { valor: '27', id: 27},
	    { valor: '28', id: 28}, { valor: '29', id: 29}, { valor: '30', id: 30},
	    { valor: '31', id: 31}
  	];

  	$ionicModal.fromTemplateUrl('edit-gasto-modal.html', {
    	scope: $scope,
      	animation: 'slide-in-up'
  	}).then(function (modal) {
      	$scope.editGastoModal = modal;
  	});

    $scope.openEditGastoModal = function(id){
    	var query = "select * from gasto g where id = ?";
	    db.transaction(function(transaction) {
	    	transaction.executeSql(query, [id],
	        	function(tx, result) {
	          		if(result.rows.length > 0){
		                $scope.gasto.id = result.rows.item(0).id;
	            		$scope.gasto.ano = result.rows.item(0).ano;
	            		$scope.gasto.mes = result.rows.item(0).mes;
	            		$scope.gasto.dia = result.rows.item(0).dia;
	            		$scope.gasto.categoria = result.rows.item(0).categoria;
	            		$scope.gasto.valor = result.rows.item(0).valor.toString().replace('.',',');
	            		$scope.gasto.descricao = result.rows.item(0).descricao;
	            		$scope.gasto.eh_constante = result.rows.item(0).eh_constante;

	            		console.log("Achei");
	            		$scope.editGastoModal.show();
	          		} else {
	              		console.log("Nao achei");
	          		}
	        	},
	        	function(error){
	          		console.log(error);
	      		}
	      	);
	    });
  	}

  	$scope.closeEditGastoModal = function () {
    	$scope.editGastoModal.hide();
  	}

  	$scope.findValueMonthById = function(arr, value) {
		var result  = arr.filter(function(o){
			return o.id == value;
		});

	  	return result? result[0].valor : null; // or undefined
	}

	$scope.formatNumber = function(value) {
		if(value < 10)
			return '0' + value;
		else
			return value;
	}

  	$scope.listaCategorias = function () {
  		console.log("RECUPERANDO CATEGORIAS...");
      	$scope.categorias = [];
      	var query = "select id, descricao from categoria order by descricao asc";
      	
      	db.transaction(function(transaction) {
        	transaction.executeSql(query, [],
          		function(tx, result) {
	            	if(result.rows.length > 0){
	                	for(var i = 0; i < result.rows.length; i++) {
	                    	$scope.categorias.push({id: result.rows.item(i).id, descricao: result.rows.item(i).descricao});
	                	}
	                	console.log(result.rows.length + " rows found.");
	            	} else {
	                	$scope.categorias = [];
	                	console.log("0 rows found.");
	            	}
          		}, function(error){
              		console.log(error);
          		}
          	);
      	});
  	}

  	if(db != null)
  		$scope.listaCategorias();

  	$scope.saveGasto = function() {
  		var query = "insert into gasto (ano, mes, dia, categoria, descricao, valor, eh_constante) values (?,?,?,?,?,?,?)";
	    var eh_constante = '';
	    if($scope.gasto.eh_constante){
	    	eh_constante = $scope.gasto.eh_constante
	    }else{
	    	eh_constante = 'false';
	    }

	    db.transaction(function(transaction) {
	    	transaction.executeSql(query, [$scope.gasto.ano,$scope.gasto.mes, $scope.gasto.dia, $scope.gasto.categoria, 
	    								   $scope.gasto.descricao, $scope.gasto.valor.replace(/,/g,'.'), eh_constante],
		        function(tx, result) {
		        	console.log("Gasto Salvo!");
		        	$cordovaToast.showShortCenter("Gasto cadastrado com sucesso!");
		        },
		        function(error){
		          	console.log("DEU ERRO AO SALVAR: " + error);
		          	$cordovaToast.showShortCenter("Ocorreu um erro!");
		      	}
	      	);
    	});
  	}

  	$scope.updateGasto = function() {
     	var query = "update gasto set ano = ?, mes = ?, dia = ?, categoria = ?, descricao = ?, valor = ?, eh_constante = ? where id = ?";
      	var eh_constante = '';
	    if($scope.gasto.eh_constante){
	    	eh_constante = $scope.gasto.eh_constante
	    }else{
	    	eh_constante = 'false';
	    }

      	db.transaction(function(transaction) {
        	transaction.executeSql(query, [$scope.gasto.ano,$scope.gasto.mes, $scope.gasto.dia, $scope.gasto.categoria, 
	    								   $scope.gasto.descricao, $scope.gasto.valor.replace(/,/g,'.'), eh_constante, $scope.gasto.id],
          		function(tx, result) {
	            	$scope.editGastoModal.hide();
		            console.log("Update OK!");
		            $scope.searchGastos();
	          	},
          		function(error){
            		console.log("Update FAIL!");
        		}
        	);
      	});
  	}

  	$scope.removeGasto = function(id) {
  		var confirmPopup = $ionicPopup.confirm({
	    	title: 'Alerta',
	    	template: 'Tem certeza que deseja excluir o gasto?',
	    	cancelText: 'Não',
	    	okText: 'Sim'
	    });

	    confirmPopup.then(function(res) {
	    	if(res) {
	       		var query = "delete from gasto where id = ?";
		      	db.transaction(function(transaction) {
		        	transaction.executeSql(query, [id],
		          		function(tx, result) {
		        			console.log("Delete OK!");
		        			$scope.searchGastos();
		        			//Essa linha combinada com a linha '$ionicConfigProvider.views.maxCache(0);' presente no 'app.js' permite atualizar a lista
		        			$state.go($state.current, {gastos: $scope.gastos});
		          		},
		          		function(error){
		            		console.log("Delete FAIL!");
		            		$cordovaToast.showShortCenter("Não foi possível excluir!");
		        		}
		        	);
		      	});
	     	} 
	   	});
  	}

  	$scope.searchGastos = function () {
  		console.log("BUSCANDO GASTOS...");
      	$scope.gastos = [];
      	var data = '';
      	var query = '';

      	if ($scope.gasto.categoria == null)
      		$scope.gasto.categoria = 0

      	if ($scope.gasto.categoria == 0)
      		query = "select g.id, g.descricao, g.valor, g.ano, g.mes, g.dia, c.descricao as categoria from gasto g, categoria c"
      				+ " where g.categoria = c.id and ano = ? and mes = ? and g.categoria <> ? order by  c.descricao, dia asc";
      	else
      		query = "select id, descricao, valor, ano, mes, dia from gasto where ano = ? and mes = ? and categoria = ? order by dia asc";

      	db.transaction(function(transaction) {
        	transaction.executeSql(query, [$scope.gasto.ano, $scope.gasto.mes, $scope.gasto.categoria],
          		function(tx, result) {
	            	if(result.rows.length > 0){
	                	for(var i = 0; i < result.rows.length; i++) {
	                		data = $scope.formatNumber(result.rows.item(i).dia) + "/" + $scope.formatNumber(result.rows.item(i).mes) + 
		                				"/" + result.rows.item(i).ano;
	                    	$scope.gastos.push({id: result.rows.item(i).id, descricao: result.rows.item(i).descricao,
	                    			data: data, valor: result.rows.item(i).valor, categoria: result.rows.item(i).categoria});
	                	}
	                	console.log(result.rows.length + " rows found.");
	                	$state.go($state.current, {gastos: $scope.gastos, gasto: $scope.gasto});
	            	} else {
	                	$scope.gastos = [];
	                	console.log("0 rows found.");
	                	$cordovaToast.showShortCenter("Nenhum gasto encontrado!");
	            	}
          		}, function(error){
              		console.log(error);
          		}
          	);
      	});
  	}

  	$scope.relatorioAnual = function() {
	    console.log("RECUPERANDO GASTOS ANUAIS...");
      	$scope.gastos = [];
      	var query = "";
      	var data = ""; 
      	var tipo_gasto = $scope.gasto.tipo;
      	$scope.titulo_relatorio = 'Relatório Anual ' + $scope.gasto.ano;
      	
      	if(tipo_gasto == 2){//Todos
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and g.categoria = c.id"
      					 + " order by mes, c.descricao, dia";
      	}else if(tipo_gasto == 1){//Constante
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and eh_constante = 'true' "
      					 + " and g.categoria = c.id order by mes, c.descricao, dia";
      	}else if(tipo_gasto == 0){//Não constante
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and eh_constante = 'false'"
      					 + " and g.categoria = c.id order by mes, c.descricao, dia";
      	}
      	
      	if(db != null){
	      	db.transaction(function(transaction) {
	        	transaction.executeSql(query, [$scope.gasto.ano],
	          		function(tx, result) {
		            	if(result.rows.length > 0){
		                	for(var i = 0; i < result.rows.length; i++) {
		                		$scope.totalMes = $scope.totalMes + result.rows.item(i).valor;
		                		$scope.totalCategoria = $scope.totalCategoria + result.rows.item(i).valor;
		                		data = $scope.formatNumber(result.rows.item(i).dia) + "/" + $scope.formatNumber(result.rows.item(i).mes) + 
		                				"/" + result.rows.item(i).ano;
		                    	$scope.gastos.push({id: result.rows.item(i).id, ano: result.rows.item(i).ano,
		                    		mes: result.rows.item(i).mes, dia: result.rows.item(i).dia,
		                    		data: data, mes_extenso: $scope.findValueMonthById($scope.meses, result.rows.item(i).mes),
		                    		categoria: result.rows.item(i).categoria, descricao: result.rows.item(i).descricao,
		                    		valor: result.rows.item(i).valor, eh_constante: result.rows.item(i).eh_constante,
		                    		total_categoria: $scope.totalCategoria, total_mes: $scope.totalMes});

		                    	// Condicional para zerar o total da categoria
		                    	if(i < result.rows.length -1 && (result.rows.item(i+1).categoria != result.rows.item(i).categoria || 
		                    		result.rows.item(i+1).mes != result.rows.item(i).mes)){
		                    		$scope.totalCategoria = 0;
		                    	}
		                    	// Condicional para zerar o total do mês
		                    	if(i < result.rows.length -1 && result.rows.item(i+1).mes != result.rows.item(i).mes){
		                    		$scope.totalMes = 0;
		                    	}
		                	}
		                	$state.go('app.relatorio_anual_lista', {gastos: $scope.gastos, titulo_relatorio: $scope.titulo_relatorio});  
		                	console.log(result.rows.length + " rows found.");
		            	} else {
		                	$scope.gastos = [];
		                	console.log("0 rows found.");
		                	$cordovaToast.showShortCenter("Nenhum gasto encontrado!");
		            	}
	          		}, function(error){
	              		console.log(error);
	          		}
	          	);
	      	});
	    }
  	}

  	$scope.relatorioMensal = function() {
	    console.log("RECUPERANDO GASTOS MENSAIS...");
      	$scope.gastos = [];
      	var query = "";
      	var data = "";
      	var tipo_gasto = $scope.gasto.tipo;
      	$scope.titulo_relatorio = 'Relatório Mensal ' + $scope.findValueMonthById($scope.meses, $scope.gasto.mes) + " de " + $scope.gasto.ano;
      	
      	if(tipo_gasto == 2){//Todos
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and mes = ?"
      					+ " and g.categoria = c.id order by c.descricao, dia";
      	}else if(tipo_gasto == 1){//Constante
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and mes = ? and eh_constante = 'true'"
      					+ " and g.categoria = c.id order by c.descricao, dia";
      	}else if(tipo_gasto == 0){//Não constante
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and mes = ? and eh_constante = 'false'"
      					+ " and g.categoria = c.id order by c.descricao, dia";
      	}
      	
      	if(db != null){
	      	db.transaction(function(transaction) {
	        	transaction.executeSql(query, [$scope.gasto.ano, $scope.gasto.mes],
	          		function(tx, result) {
		            	if(result.rows.length > 0){
		                	for(var i = 0; i < result.rows.length; i++) {
		                		$scope.totalMes = $scope.totalMes + result.rows.item(i).valor;
		                    	$scope.totalCategoria = $scope.totalCategoria + result.rows.item(i).valor;
		                    	data = $scope.formatNumber(result.rows.item(i).dia) + "/" + $scope.formatNumber(result.rows.item(i).mes) + 
		                				"/" + result.rows.item(i).ano;
		                    	$scope.gastos.push({id: result.rows.item(i).id, ano: result.rows.item(i).ano,
		                    		mes: result.rows.item(i).mes, dia: result.rows.item(i).dia,
		                    		data: data,categoria: result.rows.item(i).categoria, descricao: result.rows.item(i).descricao,
		                    		valor: result.rows.item(i).valor, eh_constante: result.rows.item(i).eh_constante,
		                    		total_categoria: $scope.totalCategoria, total_mes: $scope.totalMes});
		                	
		                    	// Condicional para zerar o total da categoria
		                    	if(i < result.rows.length-1 && (result.rows.item(i+1).categoria != result.rows.item(i).categoria || 
		                    		result.rows.item(i+1).mes != result.rows.item(i).mes)){
		                    		$scope.totalCategoria = 0;
		                    	}
		                	}
		                	$state.go('app.relatorio_mensal_lista', {gastos: $scope.gastos, titulo_relatorio: $scope.titulo_relatorio});
		                	console.log(result.rows.length + " rows found.");
		            	} else {
		                	$scope.gastos = [];
		                	console.log("0 rows found.");
		                	$cordovaToast.showShortCenter("Nenhum gasto encontrado!");
		            	}
	          		}, function(error){
	              		console.log(error);
	          		}
	          	);
	      	});
	    }
  	}

  	$scope.relatorioMensalPeriodo = function() {
	    console.log("RECUPERANDO GASTOS MENSAIS...");
      	$scope.gastos = [];
      	var query = "";
      	var data = "";
      	var tipo_gasto = $scope.gasto.tipo;
      	$scope.titulo_relatorio = 'Gastos de ' + $scope.formatNumber($scope.gasto.dia_inicial) + ' a '
      								+ $scope.formatNumber($scope.gasto.dia_final) + ' de ' + $scope.findValueMonthById($scope.meses, $scope.gasto.mes);
      	
      	if(tipo_gasto == 2){//Todos
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and mes = ? and dia between ? and ?"
      					+ " and g.categoria = c.id order by c.descricao, dia";
      	}else if(tipo_gasto == 1){//Constante
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and mes = ? and eh_constante = 'true'"
      					+ " and dia between ? and ? and g.categoria = c.id order by c.descricao, dia";
      	}else if(tipo_gasto == 0){//Não constante
      		query = "select g.*, c.descricao as categoria from gasto g, categoria c where ano = ? and mes = ? and eh_constante = 'false'"
      					+ " and dia between ? and ? and g.categoria = c.id order by c.descricao, dia";
      	}
      	
      	if(db != null){
	      	db.transaction(function(transaction) {
	        	transaction.executeSql(query, [$scope.gasto.ano, $scope.gasto.mes, $scope.gasto.dia_inicial, $scope.gasto.dia_final],
	          		function(tx, result) {
		            	if(result.rows.length > 0){
		                	for(var i = 0; i < result.rows.length; i++) {
		                		$scope.totalMes = $scope.totalMes + result.rows.item(i).valor;
		                    	$scope.totalCategoria = $scope.totalCategoria + result.rows.item(i).valor;
		                    	data = $scope.formatNumber(result.rows.item(i).dia) + "/" + $scope.formatNumber(result.rows.item(i).mes) + 
		                				"/" + result.rows.item(i).ano;
		                    	$scope.gastos.push({id: result.rows.item(i).id, ano: result.rows.item(i).ano,
		                    		mes: result.rows.item(i).mes, dia: result.rows.item(i).dia,
		                    		data: data,categoria: result.rows.item(i).categoria, descricao: result.rows.item(i).descricao,
		                    		valor: result.rows.item(i).valor, eh_constante: result.rows.item(i).eh_constante,
		                    		total_categoria: $scope.totalCategoria, total_mes: $scope.totalMes});
		                	
		                    	// Condicional para zerar o total da categoria
		                    	if(i < result.rows.length-1 && (result.rows.item(i+1).categoria != result.rows.item(i).categoria || 
		                    		result.rows.item(i+1).mes != result.rows.item(i).mes)){
		                    		$scope.totalCategoria = 0;
		                    	}
		                	}
		                	$state.go('app.relatorio_mensal_periodo_lista', {gastos: $scope.gastos, titulo_relatorio: $scope.titulo_relatorio});
		                	console.log(result.rows.length + " rows found.");
		            	} else {
		                	$scope.gastos = [];
		                	console.log("0 rows found.");
		                	$cordovaToast.showShortCenter("Nenhum gasto encontrado!");
		            	}
	          		}, function(error){
	              		console.log(error);
	          		}
	          	);
	      	});
	    }
  	}
})

.controller('DatabaseCtrl', function($scope, $cordovaToast, $timeout, $cordovaFileTransfer) {
	
    $scope.downloadDatabase = function(){
    	var url = cordova.file.applicationStorageDirectory + 'databases/base.db';
	    var targetPath = cordova.file.externalDataDirectory + "base.db";
	    var trustHosts = true;
	    var options = {};

	    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
	    	.then(function(result) {
	        	$cordovaToast.showLongCenter("Base copiada com sucesso para o diretorio: " + cordova.file.externalDataDirectory + "base.db");
	      	}, function(err) {
	      		$cordovaToast.showShortCenter("Deu erro ao copiar!");
	        	console.log("DEU ERRO AO COPIAR");
	      	}, function (progress) {
	        	$timeout(function () {
	          		$scope.downloadProgress = (progress.loaded / progress.total) * 100;
	        	});
	      	});
	}

	$scope.uploadDatabase = function(){
    	var url = cordova.file.externalDataDirectory + "base.db";
	    var targetPath = cordova.file.applicationStorageDirectory + 'databases/base.db';
	    var trustHosts = true;
	    var options = {};

	    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
	    	.then(function(result) {
	        	$cordovaToast.showLongCenter("Upload realizado com sucesso!");
	      	}, function(err) {
	      		$cordovaToast.showShortCenter("Deu erro ao fazer upload!");
	        	console.log("DEU ERRO NO UPLOAD");
	      	}, function (progress) {
	        	$timeout(function () {
	          		$scope.downloadProgress = (progress.loaded / progress.total) * 100;
	        	});
	      	});
	}
})
   