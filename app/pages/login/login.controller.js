(function() {
	'use strict';

	angular
		.module('app')
		.controller('LoginController', LoginController);

	LoginController.$inject = ['$location', 'loginService'];
	function LoginController($location, loginService) {
		var vm = this;
		vm.loading = false;
		vm.error = '';
		vm.login = login;

		function login() {
			vm.loading = true;

			loginService.login(vm.user)
				.then(loginComplete);

			function loginComplete(response) {
				console.log(response);
				if (response === "true") {
					$location.url("/dashboard");
				} else {
					vm.loading = false;
					vm.error = 'Username or password was incorrect.';
				}
			}
		}
	}
})();