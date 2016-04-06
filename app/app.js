(function() {
	'use strict';

	angular
		.module('app', ['ngRoute'])
		.controller('AppController', AppController);

	AppController.$inject = ['$rootScope', '$location', 'appService'];
	function AppController($rootScope, $location, appService) {
		$rootScope.$on('$locationChangeStart', checkAuthentication);

		function checkAuthentication() {
			console.log('changed route');
			appService.isAuthenticated();
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.config(config);

	config.$inject = ['$routeProvider'];
	function config($routeProvider) {
		$routeProvider
			.when('/login', {
				templateUrl: 'modules/login/login.html',
				controller: 'LoginController',
				controllerAs: 'vm'
			})
			.when('/logout', {
				templateUrl: 'modules/logout/logout.html',
				controller: 'LogoutController',
				controllerAs: 'vm'
			})
			.when('/register', {
				templateUrl: 'pages/register/register.html',
				controller: 'RegisterController',
				controllerAs: 'vm'
			})
			.when('/dashboard', {
				templateUrl: 'pages/dashboard/dashboard.html',
				controller: 'DashboardController',
				controllerAs: 'vm'
			})
			.otherwise({
				redirectTo: '/dashboard'
			});
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('appService', appService);

	appService.$inject = ['$location', 'sessionService'];
	function appService($location, sessionService) {
		return {
			isAuthenticated: isAuthenticated
		};

		function isAuthenticated() {
			sessionService.getVar('name')
				.then(isAuthenticatedComplete);

			function isAuthenticatedComplete(response) {
				if (response.data === 'false') {
					$location.url('/login');
				}

				console.log('authenticated!!');
			}
		}
	}
})();

(function() {
	'use strict';

	/**
	* Used to access the api of the various item types.
	* An instance of crud must be created in order to use the service.
	*/

	angular
		.module('app')
		.factory('crudService', crudService);

	crudService.$inject = ['$http', '$log'];
	function crudService($http, $log) {
		var crud = init;
		crud.prototype = {
			get: get,
			create: create,
			update: update,
			remove: remove
		};

		return crud;

		/**
		* @param {string} type
		*/
		function init(type) {
			this.base = 'api/' + type + '/' + type + 'Manager.php'; // jshint ignore:line
		}

		/**
		* @param	{string}	id		ID of item type to get.
		* @return	{mixed[]|string}	Query results or "false" on failure.
		*/
		function get(id) {
			return $http.get(this.base + '?id=' + id) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param	{mixed[]}	data	Data of item to create.
		* @return	{string}			"1" on success or "false" on failure.
		*/
		function create(data) {
			return $http.post(this.base, data) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param	{string}	id		ID of item type to update.
		* @param	{mixed[]}	data	Data of item to update.
		*
		* @return	{string}			"1" on success or "false" on failure.
		*/
		function update(id, data) {
			return $http.put(this.base + '?id=' + id, data) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param	{string}	id		ID of item type to delete.
		* @return	{string}			"1" on success or "false" on failure.
		*/
		function remove(id) {
			return $http.delete(this.base + '?id=' + id) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		function promiseComplete(response) {
			return response.data;
		}

		function promiseFailed(error) {
			$log.error(error);
			return false;
		}
	}
})();

(function() {
	'use strict';

	/**
	* Used to access session variables.
	*/

	angular
		.module('app')
		.factory('sessionService', sessionService);

	sessionService.$inject = ['$http', '$log'];
	function sessionService($http, $log) {
		var vm = this;  // jshint ignore:line
		vm.base = 'api/session/sessionVarManager.php?var=';

		return {
			getVar: getVar,
			setVar: setVar
		};

		/**
		* @param  {string} $name Variable name to get from session.
		* @return {string} 		 Variable value or false on failure.
		*/
		function getVar($name) {
			return $http.get(vm.base + $name)
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param {string} $name Variable name to get from session.
		* @return {bool} 		True on success or false on failure.
		*/
		function setVar($name, $value) {
			return $http.post(vm.base + $name, $value)
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		function promiseComplete(response) {
			return response.data;
		}

		function promiseFailed(error) {
			$log.error(error);
			return false;
		}
	}
})();

(function() {
	'use strict';

	/**
	* Compare an input field to another field, determined by the dev.
	*/

	angular
		.module('app')
		.directive('spCompareTo', compareTo);

	function compareTo() {
		var directive = {
			require: 'ngModel',
			scope: {
				otherModel: '=spCompareTo'
			},
			link: link
		};
		return directive;

		function link(scope, element, attrs, ngModel) {
			var unbindWatch = scope.$watch('otherModel', validateOnChange);
			ngModel.$validators.spCompareTo = compareValues;
			element.on('$destroy', cleanUp);

			function cleanUp() {
				unbindWatch();
			}

			function compareValues(viewValue) {
				return (viewValue === scope.otherModel.$viewValue);
			}

			function validateOnChange(newValue, oldValue) {
				ngModel.$validate();
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.controller('LoginController', LoginController);

	LoginController.$inject = ['loginService'];
	function LoginController(loginService) {
		var vm = this;
		vm.loading = false;
		vm.error = '';

		vm.login = login;

		function login() {
			vm.loading = true;
			loginService.login(vm.user)
				.then(loginComplete);

			function loginComplete(response) {
				vm.loading = false;
				vm.error = response;
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('loginService', loginService);

	loginService.$inject = ['$http', '$location', '$log'];
	function loginService($http, $location, $log) {
		var vm = this;  // jshint ignore:line

		return {
			login: login
		};

		function login(user) {
			return $http.post('api/managers/loginManager.php', user)
				.then(loginComplete)
				.catch(loginFailed);

			function loginComplete(response) {
				if (response.data === "true") {
					$location.url('/dashboard');
				}
				return 'Username or password was incorrect.';
			}

			function loginFailed(error) {
				$log.error(error);
				return 'Something went wrong. Please try again.';
			}
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.controller('DashboardController', DashboardController);

	function DashboardController() {

	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.controller('RegisterController', RegisterController);

	RegisterController.$inject = ['registerService'];
	function RegisterController(registerService) {
		var vm = this;
		vm.loading = false;
		vm.error = '';

		vm.register = register;

		function register() {
			vm.loading = true;
			registerService.register(vm.user)
				.then(registrationComplete);

			function registrationComplete(response) {
				vm.loading = false;
				vm.error = response;
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('registerService', registerService);

	registerService.$inject = ['$location', 'crudService'];
	function registerService($location, crudService) {
		var vm = this;  // jshint ignore:line
		vm.crud = new crudService('user');

		return {
			register: register
		};

		function register(user) {
			return vm.crud.create(user)
				.then(registrationComplete);

			function registrationComplete(response) {
				if (response === "1") {
					$location.url('/login');
				}
				return 'Username taken.';
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.controller('HeaderController', HeaderController);

	HeaderController.$inject = [ 'headerService' ];
	function HeaderController(headerService) {
		var vm = this;
		vm.name = '';
		vm.url = '';

		headerService.getUser()
			.then(getUserComplete);

		function getUserComplete(response) {
			vm.name = (response.name === false) ? 'Login' : response.name;
			vm.url = response.url;
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.directive('spHeader', headerDirective);

	function headerDirective() {
		return {
			link: link,
			templateUrl: 'pages/layout/header/header.html',
			controller: 'HeaderController',
			controllerAs: 'vm',
			bindToController: true
		};

		function link(scope, element, attrs) {
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('headerService', headerService);

	headerService.$inject = ['sessionService'];
	function headerService(sessionService) {
		return {
			getUser: getUser
		};

		/**
		* Get the username of the logged in user.
		* @return {name: string|false, url: string}  Username (or false if not logged in) and url to redirect to in the header.
		*/
		function getUser() {
			sessionService.getVar('name')
				.then(getNameComplete);

			function getNameComplete(response) {
				if (response.data === 'false') {
					return {name: false, url: '/login'};
				}

				return {name: response, url: '/dashboard'};
			}
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.controller('SidebarController', SidebarController);

	function SidebarController() {
		var vm = this;

		vm.collapsed = true;

		vm.toggleSidebar = function() {
			vm.collapsed = !vm.collapsed;
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.directive('spSidebar', sidebarDirective);

	function sidebarDirective() {
		return {
			link: link,
			templateUrl: 'pages/layout/sidebar/sidebar.html',
			controller: 'SidebarController',
			controllerAs: 'vm',
			bindToController: true
		};

		function link(scope, element, attrs) {
			scope.$watch(attrs.sidebarDirective, toggleSidebar);

			function toggleSidebar(collapsed) {
				if (collapsed) {
					element.removeClass('collapsed');
				} else {
					element.addClass('collapsed');
				}
			}
		}
	}
})();