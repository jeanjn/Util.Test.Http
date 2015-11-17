var app = angular.module('myApp',[]);

app.run(function($rootScope){
	app.get = function(variable){
		var obj = JSON.parse(localStorage.httpApp);
		return obj[variable];
	}

	app.set = function(variable, value){
		var obj = JSON.parse(localStorage.httpApp);
		obj[variable] = value
		localStorage.httpApp = JSON.stringify(obj);
	}

	if(!localStorage.httpApp){
		var httpApp = {
			cmd: {
				token: '',
				tokenUrl: 'http://localhost:28412/token',
				service: 'http://localhost:28412/api/',
				user: 'suporte@micromust.com.br',
				password: 'suporte',
				paths: app.paths,
				path: 'Select a path'
			},
			paths: ['Curso/GetAll','Curso/Get','Curso/Post','Curso/Put', 'TabelaValor/GetAll', 'UsuarioPf/Post',
			 		'Evento/GetAll', 'Evento/Get', 'Evento/GetInscribes', 'Evento/Inscribe', 'Debito/GetAllOwn']
		}
		localStorage.httpApp = JSON.stringify(httpApp);
	}
})
.controller('HttpController', function ($scope){
	$scope.cmd = app.get('cmd');
	$scope.paths = app.get('paths');
	

	$scope.getToken = function (){
		$.ajax({
			url: $scope.cmd.tokenUrl,
			method: 'POST',
			data: {
						username: $scope.cmd.user, 
						password: $scope.cmd.password, 
						grant_type: 'password', 
					},
			dataType: 'json',
			success: function (data){
				$scope.cmd.token = 'Bearer ' + data.access_token;
				onSuccess({data: 'Authenticated'})
			},
			error: onError
		});
	};

	$scope.onGet = function () {
		var json = toJson($scope.cmd.stringData);
		get($scope.cmd.path, json);
	};

	$scope.onPost = function () {
		var json = toJson(cmd.stringData);
		post(cmd.path, json);
	};

	function get(path, data){ sendRequest(path, data, 'GET'); };

	function post(path, data){ sendRequest(path, data, 'POST'); };

	function sendRequest(path, data, method){
		$.ajax({
			url: cmd.service + path,
			method: method,
			headers: {Authorization: cmd.token},
			data: data,
			dataType: 'json',
			success: onSuccess,
			error: onError
		});
	};

	function onSuccess(data){
		cmd.status = "Success on send request";
		try{
			var output = JsonHuman.format(data);
			cmd.result = output;
		}
		catch(e){
			cmd.result = data;	
		}
		cmd.simpleResult = data;
		$scope.$apply();
	};

	function onError(data){
		cmd.status = "Error on send request";
		var response = data.responseText;
		var jsonObj = '';
		try{
			jsonObj = JSON.parse(response);
			var output = JsonHuman.format(jsonObj);
			cmd.result = output;
		}
		catch(e){
			cmd.result = response;	
		}
		cmd.simpleResult = response;
		$scope.$apply();
	};

	function toJson (string) {
		try{
			return JSON.parse(string);
		}
		catch (error) {
			return {};
		}
	};

	$scope.$watch('cmd.stringData',function(){ $scope.updateHumanData(); });

	$scope.onChangePath = function (){
		$scope.cmd.path = this.path;
	}

	$scope.updateHumanData = function (){
		var json = toJson($scope.cmd.stringData);
		$scope.cmd.humanData = JsonHuman.format(json);
	};

	$scope.pushPath = function (newPath){
		if($scope.paths.indexOf(newPath) > -1){
			return;
		}

		$scope.paths.push(newPath)
		app.set('paths', $scope.paths);
	}

	$scope.removePath = function (element){
		var index = $scope.paths.indexOf(element);
		$scope.paths.splice(index,1);
		app.set('paths', $scope.paths);	
	}
})
.directive('bindHtmlUnsafe', function( $parse, $compile ) {
    return function( $scope, $element, $attrs ) {
        var compile = function( newHTML ) {
            newHTML = $compile(newHTML)($scope);
            $element.html('').append(newHTML);        
        };
        
        var htmlName = $attrs.bindHtmlUnsafe;
        
        $scope.$watch(htmlName, function( newHTML ) {
            if(!newHTML) return;
            compile(newHTML);
        });
   
    };
})
.directive('httpSelect', function(){

	var onSelect = function() {
		var value = this.getElementsByClassName('path-option')[0].innerHTML;
        this.button.innerHTML = value;
    };

	function makeSelect(){
		var options = app.get('paths'); 
		var element = document.createElement('DIV');
		var button = document.createElement('BUTTON');

	    button.id = "button-path"; // this is how Material Design associates option/button
	    button.setAttribute('class', 'mdl-button mdl-js-button');
	    button.innerHTML = '{{cmd.path}}';
	    element.appendChild(button);


	    // add the options to the button (unordered list)
	    var ul = document.createElement('UL');
	    ul.setAttribute('class', 'mdl-menu mdl-js-menu mdl-js-ripple-effect');
	    ul.setAttribute('for', "button-path"); // associate button

	    var li = document.createElement('LI');
        li.setAttribute('class', 'mdl-menu__item');
        li.setAttribute('ng-click','onChangePath()');
        li.setAttribute('ng-repeat','path in paths');
        li.innerHTML = '<span class="path-option">{{path}}</span>';
        ul.appendChild(li);

	    element.appendChild(ul);	
	    return element;
	};

	return {
		template: function (){
			return makeSelect();
		}
	};

}).directive('httpConfig', function(){
	return {
		templateUrl: 'assets/tpl/config.html'
	}
})
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

