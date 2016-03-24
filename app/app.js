(function() {
	'use strict';

	angular
		.module('app', ['ngRoute'])
		.controller('AppController', AppController);

	function AppController() {
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
				templateUrl: 'login/login.html',
				controller: 'LoginController',
				controllerAs: 'vm'
			})
			.when('/logout', {
				templateUrl: 'logout/logout.html',
				controller: 'LogoutController',
				controllerAs: 'vm'
			})
			.when('/register', {
				templateUrl: 'register/register.html',
				controller: 'RegisterController',
				controllerAs: 'vm'
			})
			.when('/dashboard', {
				templateUrl: 'dashboard/dashboard.html',
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
		.controller('DashboardController', DashboardController);

	function DashboardController() {

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

			function compareValues(viewValue) {
				return (viewValue === scope.otherModel.$viewValue);
			}

			function cleanUp() {
				unbindWatch();
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

	function LoginController() {

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

		vm.registerUser = registerUser;

		function registerUser() {
			registerService.registerUser(vm.user);
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('registerService', registerService);

	registerService.$inject = ['$http', '$location', '$log'];
	function registerService($http, $location, $log) {
		return {
			registerUser: registerUser
		};

		function registerUser(user) {
			return $http({
				method: 'post',
				url: 'api/Database/CreateItem.php',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					type: 'PERSON',
					name: user.name,
					password: user.password,
					email: user.email
				}
			})
				.then(registerUserComplete)
				.catch(registerUserFailed);

			function registerUserComplete(response) {
				return response.data;
			}

			function registerUserFailed(error) {
				$log.error(error);
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
			templateUrl: 'sidebar/sidebar.html',
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