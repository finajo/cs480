(function() {
	'use strict';

	angular
		.module('app')
		.service('cacheService', cacheService);

	cacheService.$inject = ['$rootScope', 'crudService'];
	function cacheService($rootScope, crudService) {
		var vm = this; // jshint ignore: line
		vm.calendars = [];
		vm.events = [];
		vm.labels = [];
		vm.tasks = [];

		return {
			cacheAll: cacheAll,
			cacheCalendars: cacheCalendars,
			cacheEvents: cacheEvents,
			cacheLabels: cacheLabels,
			cacheTasks: cacheTasks,
			clearCache: clearCache,

			getAll: getAll,
			getCalendars: getCalendars,
			getEvents: getEvents,
			getLabels: getLabels,
			getTasks: getTasks
		};

		// TODO: Ideally one API call.
		function cacheAll() {
			cacheCalendars();
			cacheEvents();
			cacheLabels();
			cacheTasks();
		}

		function cacheCalendars() {
			vm.calendar = new crudService('calendar');
			vm.calendar.getByUser()
				.then(function(response) {
					vm.calendars = getResult(response);
					updateCalendars();
				});
		}

		function cacheEvents() {
			vm.event = new crudService('event');
			vm.event.getByUser()
				.then(function(response) {
					vm.events = getResult(response);
					updateEvents();
				});
		}

		function cacheLabels() {
			vm.label = new crudService('label');
			vm.label.getByUser()
				.then(function(response) {
					vm.labels = getResult(response);
					updateLabels();
				});
		}

		function cacheTasks() {
			vm.task = new crudService('task');
			vm.task.getByUser()
				.then(function(response) {
					vm.tasks = getResult(response);
					updateTasks();
				});
		}

		function clearCache() {
			vm.calendars = [];
			vm.events = [];
			vm.labels = [];
			vm.tasks = [];

			updateCalendars();
			updateEvents();
			updateLabels();
			updateTasks();
		}

		function getResult(response) {
			var result = response.data;
			return result.success ? result.data : result.title;
		}

		function getAll() {
			return {
				calendars: getCalendars(),
				events: getEvents(),
				labels: getLabels(),
				tasks: getTasks()
			};
		}

		function getCalendars() {
			return vm.calendars;
		}

		function getEvents() {
			return vm.events;
		}

		function getLabels() {
			return vm.labels;
		}

		function getTasks() {
			return vm.tasks;
		}

		function updateCalendars() {
			$rootScope.$broadcast('updateCalendars');
		}

		function updateEvents() {
			$rootScope.$broadcast('updateEvents');
		}

		function updateLabels() {
			$rootScope.$broadcast('updateLabels');
		}

		function updateTasks() {
			$rootScope.$broadcast('updateTasks');
		}
	}
})();
