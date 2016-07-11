// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var db = null;

angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite, $cordovaFile) {
    $ionicPlatform.ready(function() {

        if(window.StatusBar) {
           StatusBar.styleDefault();
        }

        dbDirectory = cordova.file.applicationStorageDirectory + 'databases';
        db = $cordovaSQLite.openDB({name: "base.db", location: dbDirectory});
        //db = $cordovaSQLite.openDB({ name: "base.db" });
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS categoria (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao text)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS gasto (id INTEGER PRIMARY KEY AUTOINCREMENT, ano integer," 
                  + "mes integer, dia integer, categoria integer, descricao text, valor real, eh_constante integer)");
    });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'GastoCtrl'
    })

    .state('app.menu_cadastros', {
      cache: false,
      url: "/menu_cadastros",
      views: {
        'menuContent' :{
          templateUrl: "templates/menu_cadastros.html"
        }
      }
    })

    .state('app.menu_consultas', {
      cache: false,
      url: "/menu_consultas",
      views: {
        'menuContent' :{
          templateUrl: "templates/menu_consultas.html"
        }
      }
    })

    .state('app.menu_relatorios', {
      cache: false,
      url: "/menu_relatorios",
      views: {
        'menuContent' :{
          templateUrl: "templates/menu_relatorios.html"
        }
      }
    })

    .state('app.menu_database', {
      cache: false,
      url: "/menu_database",
      views: {
        'menuContent' :{
          templateUrl: "templates/menu_database.html"
        }
      }
    })

    .state('app.home', {
      cache: false,
      url: "/home",
      views: {
        'menuContent' :{
          templateUrl: "templates/home.html",
        }
      }
    })

    .state('app.about', {
      cache: false,
      url: "/about",
      views: {
        'menuContent' :{
          templateUrl: "templates/about.html",
        }
      }
    })

    .state('app.cadastro_categoria', {
      cache: false,
      url: "/cadastro_categoria",
      views: {
        'menuContent' :{
          templateUrl: "templates/cadastro_categoria.html",
          controller: "CategoriaCtrl"
        }
      }
    })

    .state('app.cadastro_gasto', {
      cache: false, // para limpar o cache e preencher listas que houver na view
      url: "/cadastro_gasto",
      views: {
        'menuContent' :{
          templateUrl: "templates/cadastro_gasto.html",
          controller: 'GastoCtrl'
        }
      }
    })

    .state('app.consulta_categoria', {
      cache: false,
      url: "/consulta_categoria",
      views: {
        'menuContent' :{
          templateUrl: "templates/consulta_categoria.html",
          controller: "CategoriaCtrl"
        }
      }
    })

    .state('app.consulta_gastos', {
      cache: false,
      url: "/consulta_gastos",
      views: {
        'menuContent' :{
          templateUrl: "templates/consulta_gastos.html",
          controller: "GastoCtrl"
        }
      }
    })

    .state('app.relatorio_anual', {
      cache: false, 
      url: "/relatorio_anual",
      views: {
        'menuContent' :{
          templateUrl: "templates/relatorio_anual.html",
          controller: 'GastoCtrl'
        }
      }
    })

    .state('app.relatorio_mensal', {
      cache: false, 
      url: "/relatorio_mensal",
      views: {
        'menuContent' :{
          templateUrl: "templates/relatorio_mensal.html",
          controller: 'GastoCtrl'
        }
      }
    })

    .state('app.relatorio_mensal_periodo', {
      cache: false, 
      url: "/relatorio_mensal_periodo",
      views: {
        'menuContent' :{
          templateUrl: "templates/relatorio_mensal_periodo.html",
          controller: 'GastoCtrl'
        }
      }
    })

    .state('app.relatorio_anual_lista', {
      url: '/relatorio_anual_lista',
      params: {
        gastos: null,
        titulo_relatorio: null
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/relatorio_anual_lista.html',
          controller: function($scope, $stateParams) {
             $scope.gastos = $stateParams.gastos;
             $scope.titulo_relatorio = $stateParams.titulo_relatorio;
          }
        }
      }
    })

    .state('app.relatorio_mensal_lista', {
      url: '/relatorio_mensal_lista',
      params: {
        gastos: null,
        titulo_relatorio: null
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/relatorio_mensal_lista.html',
          controller: function($scope, $stateParams) {
             $scope.gastos = $stateParams.gastos;
             $scope.titulo_relatorio = $stateParams.titulo_relatorio;
          }
        }
      }
    })

    .state('app.relatorio_mensal_periodo_lista', {
      url: '/relatorio_mensal_periodo_lista',
      params: {
        gastos: null,
        titulo_relatorio: null
      },
      views: {
        'menuContent': {
          templateUrl: 'templates/relatorio_mensal_periodo_lista.html',
          controller: function($scope, $stateParams) {
             $scope.gastos = $stateParams.gastos;
             $scope.titulo_relatorio = $stateParams.titulo_relatorio;
          }
        }
      }
    })

    .state('app.download_database', {
      cache: false, 
      url: "/download_database",
      views: {
        'menuContent' :{
          templateUrl: "templates/download_database.html",
          controller: 'DatabaseCtrl'
        }
      }
    })

    .state('app.upload_database', {
      cache: false, 
      url: "/upload_database",
      views: {
        'menuContent' :{
          templateUrl: "templates/upload_database.html",
          controller: 'DatabaseCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');

  $ionicConfigProvider.views.maxCache(0);
});

