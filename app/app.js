(function() {
	'use strict';

	angular
		.module('app', ['ui.router', 'ui.bootstrap', 'angularMoment'])
		.controller('AppController', AppController);

	AppController.$inject = ['$rootScope', 'appService'];
	function AppController($rootScope, appService) {
		$rootScope.$on('$stateChangeError', appService.stateChangeError);
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.config(appConfig);

	appConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
	function appConfig($stateProvider, $urlRouterProvider) {

		$stateProvider
			.state('root', {
				url: '',
				templateUrl: 'index.html',
				abstract: true,
				resolve: {
					tasks: ['tasksService', getTasks],
					events: ['eventsService', getEvents],
					labels: ['labelService', getLabels],
					calendars: ['calendarService', getCalendars],
					user: ['headerService', getUser]
				},
				views: {
					'header': {
						templateUrl: 'pages/layout/header/header.html',
						controller: 'HeaderController',
						controllerAs: 'hc'
					},
					'sidebar': {
						templateUrl: 'pages/layout/sidebar/sidebar.html',
						controller: 'SidebarController',
						controllerAs: 'sc'
					}
				}
			})
			.state('login', {
				url: '/login',
				parent: 'root',
				views: {
					'content@': {
						templateUrl: 'modules/login/login.html',
						controller: 'LoginController',
						controllerAs: 'vm'
					}
				}
			})
			.state('logout', {
				url: '/logout',
				parent: 'root',
				views: {
					'content@': {
						templateUrl: 'modules/logout/logout.html',
						controller: 'LogoutController',
						controllerAs: 'vm'
					}
				}
			})
			.state('register', {
				url: '/register',
				parent: 'root',
				views: {
					'content@': {
						templateUrl: 'pages/register/register.html',
						controller: 'RegisterController',
						controllerAs: 'vm'
					}
				}
			})
			.state('dashboard', {
				url: '/dashboard',
				parent: 'root',
				views: {
					'content@': {
						templateUrl: 'pages/dashboard/dashboard.html',
						controller: 'DashboardController',
						controllerAs: 'vm',
						resolve: {
							isAuthenticated: ['accessService', isAuthenticated]
						}
					}
				}
			})
			.state('labels', {
				url: '/labels',
				parent: 'root'
			})
			.state('labels.label', {
				url: '/:labelId',
				views: {
					'content@': {
						template: "In progress"
					}
				}
			})
			.state('inbox', {
				url: '/inbox',
				parent: 'root',
				views: {
					'content@': {
						templateUrl: 'pages/tasks/inbox.html',
						controller: 'ActivityController',
						controllerAs: 'vm',
						resolve: {
							isAuthenticated: ['accessService', isAuthenticated],
							items: ['tasksService', getTasks],
							groups: ['labelService', getLabels]
						}
					}
				}
			})
			.state('today', {
				url: '/today',
				parent: 'root',
				views: {
					'content@': {
						templateUrl: 'pages/tasks/today.html',
						controller: 'ActivityController',
						controllerAs: 'vm',
						resolve: {
							isAuthenticated: ['accessService', isAuthenticated],
							items: ['tasksService', getTasks],
							groups: ['labelService', getLabels]
						}
					}
				}
			})
			.state('week', {
				url: '/week',
				parent: 'root',
				views: {
					'content@': {
						templateUrl: 'pages/tasks/week.html',
						controller: 'ActivityController',
						controllerAs: 'vm',
						resolve: {
							isAuthenticated: ['accessService', isAuthenticated],
							items: ['tasksService', getTasks],
							groups: ['labelService', getLabels]
						}
					}
				}
			})
			.state('calendar', {
				url: '/calendar',
				parent: 'root',
				views: {
					'content@': {
						templateUrl: 'pages/calendar/calendar.html',
						controller: 'ActivityController',
						controllerAs: 'vm',
						resolve: {
							isAuthenticated: ['accessService', isAuthenticated],
							items: ['eventsService', getEvents],
							groups: ['calendarService', getCalendars]
						}
					}
				}
			});

		$urlRouterProvider.otherwise('/dashboard');

		function getCalendars(calendarService) {
			return calendarService.getCalendars();
		}

		function getEvents(eventsService) {
			return eventsService.getEvents();
		}

		function getLabels(labelService) {
			return labelService.getLabels();
		}

		function getTasks(tasksService) {
			return tasksService.getTasks();
		}

		function getUser(headerService) {
			return headerService.getUser();
		}

		function isAuthenticated(accessService) {
			return accessService.isAuthenticated();
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('appService', appService);

	appService.$inject = ['$location', 'statusService'];
	function appService($location, statusService) {
		return {
			stateChangeError: stateChangeError
		};

		function stateChangeError(event, unfoundState, fromState, fromParams) {
			if (fromParams === statusService.UNAUTHORIZED) {
				$location.path('/login');
			} else if (fromParams === statusService.FORBIDDEN) {
				$location.path('/forbidden');
			}
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.filter('sameDayAs', sameDayAs);

	sameDayAs.$inject = ['moment'];
	function sameDayAs(moment) {
		return function(events, day) {
			var sameDayEvents = [];

			for (var i = 0; i < events.length; i++) {
				var result = day.isSame(moment(events[i].dt_start), 'day');

				if (!result) {
					result = day.isSame(moment(events[i].dt_end), 'day');
				}

				if(result) {
					sameDayEvents.push(events[i]);
				}
			}

			return sameDayEvents;
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.filter('withinDays', withinDays);

	withinDays.$inject = ['moment'];
	function withinDays(moment) {
		return function(tasks, numOfDays) {
			if (!numOfDays) {
				return tasks;
			}

			var tasksWithinDays = [];

			for (var i = 0; i < tasks.length; i++) {
				var result;

				if (!tasks[i].due || (tasks[i].due &&
					moment(tasks[i].due).isBefore(moment().add(numOfDays, 'days')))
				) {
					tasksWithinDays.push(tasks[i]);
				}
			}

			return tasksWithinDays;
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.controller('ActivityController', ActivityController);

	ActivityController.$inject = ['isAuthenticated', 'items', 'groups'];
	function ActivityController(isAuthenticated, items, groups) {
		var vm = this;
		vm.items = items;
		vm.groups = groups;
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.controller('DashboardController', DashboardController);

	DashboardController.$inject = ['isAuthenticated', 'tasks', 'events', 'labels', 'calendars'];
	function DashboardController(isAuthenticated, tasks, events, labels, calendars) {
		var vm = this;
		vm.tasks = tasks;
		vm.events = events;
		vm.labels = labels;
		vm.calendars = calendars;
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
		vm.error = '';
		vm.loading = false;
		vm.register = register;

		function register() {
			vm.loading = true;
			registerService.register(vm.user)
				.then(function(response) {
					vm.loading = false;
					vm.error = response;
				});
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('registerService', registerService);

	registerService.$inject = ['$location', '$log', 'crudService'];
	function registerService($location, $log, crudService) {
		var vm = this;  // jshint ignore:line
		vm.crud = new crudService('user');

		return {
			register: register
		};

		function register(user) {
			return vm.crud.create(user)
				.then(registrationComplete);

			function registrationComplete(response) {
				if (response.success === 'false') {
					$log.error(response.title);
					return response.title;
				}
				$location.url('/login');
			}
		}
	}
})();
(function() {
	'use strict';

	/**
	* Used to access the api of the various item types.
	* An instance of crud must be created in order to use the service.
	*
	* All promises return 'success' and either 'data' on success or, on error, 'title'
	* with a general error and 'details' with more details.
	*/

	angular
		.module('app')
		.factory('crudService', crudService);

	crudService.$inject = ['$http', '$log'];
	function crudService($http, $log) {
		var crud = init;
		crud.prototype = {
			get: get,
			getWhere: getWhere,
			create: create,
			update: update,
			remove: remove,
			removeWhere: removeWhere,
			removeUnecessaryKeys: removeUnecessaryKeys
		};

		return crud;

		/**
		* Initialize the base url using the type of item to be called on.
		* Activities and their parents have a specific subfolder to be pointed to,
		* while others do not.
		*
		* @param {string} type Type of item.
		*/
		function init(type) {
			/* jshint ignore:start */
			this.type = type;
			this.base = 'api/';
			switch (type) {
				case 'event':
				case 'calendar':
					this.base += 'activity/calendar/';
					break;
				case 'label':
				case 'task':
					this.base += 'activity/task/';
					break;
				default:
					this.base += type + '/';
			}
			this.base += type + 'Manager.php';
			/* jshint ignore:end */
		}

		/**
		* @param	{string}	id		ID of item type to get.
		* @return	{string[]}			Promise with 'data' == query results on success.
		*/
		function get(id) {
			return $http.get(this.base + '?id=' + id) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param 	{string}	where 	Where clause.
		* @param	{string}	userID	For activities (tasks, events), the corresponding
		*								user for the activity. Pass empty string
		*								otherwise.
		* @return	{string[]}			Promise with 'data' == query results on success.
		*/
		function getWhere(where, userID) {
			return $http.get(this.base + '?usewhere=true&where=' + escape(where) + '&id=' + userID) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param	{mixed[]}	data	Data of item to create.
		* @return	{string[]}			Promise with 'data' === 1 on success.
		*/
		function create(data) {
			data = this.removeUnecessaryKeys(data);  // jshint ignore:line
			return $http.post(this.base, data) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param	{string}	id		ID of item type to update.
		* @param	{mixed[]}	data	Data of item to update.
		*
		* @return	{string[]}			Promise with 'data' === '1' on success.
		*/
		function update(id, data) {
			data = this.removeUnecessaryKeys(data);  // jshint ignore:line
			return $http.put(this.base + '?id=' + id, data) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param	{string}	id		ID of item type to delete.
		* @return	{string[]}			Promise with 'data' === 1 on success.
		*/
		function remove(id) {
			return $http.delete(this.base + '?id=' + id) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param 	{string}	where 	Where clause.
		* @param	{string}	userID	For activities (tasks, events), the corresponding
		*								user for the activity. Pass empty string
		*								otherwise.
		* @return	{string[]}			Promise with 'data' >= 0 on success.
		*/
		function removeWhere(where, userID) {
			return $http.delete(this.base + '?where=true&id=' + userID, where) // jshint ignore:line
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		function promiseComplete(response) {
			return response;
		}

		function promiseFailed(error) {
			$log.error(error);
			return {
				success: 'false',
				title: 'Error when querying server.',
				message: error
			};
		}

		/**
		* Item data passed in may still have their ids or alias fields (for activities)
		* embedded, which will can cause errors in the SQL.
		*
		* @param	{mixed[]} data
		* @return	{mixed[]}
		*/
		function removeUnecessaryKeys(data) {
			var toDelete = ['id', 'person_id', this.type + '_id', 'activity_info_id', 'parent_name'];  // jshint ignore:line
			for (var i = 0; i < toDelete.length; i++) {
				delete data[toDelete[i]];
			}
			return data;
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
		* @param	{string} $name	Variable name to get from session.
		* @return	{string} 		Promise or error on fail.
		*/
		function getVar($name) {
			return $http.get(vm.base + $name)
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		/**
		* @param	{string} $name	Variable name to get from session.
		* @return	{string} 		Promise or error on fail.
		*/
		function setVar($name, $value) {
			return $http.post(vm.base + $name, $value)
				.then(promiseComplete)
				.catch(promiseFailed);
		}

		function promiseComplete(response) {
			return response;
		}

		function promiseFailed(error) {
			$log.error(error);
			return {
				success: 'false',
				title: 'Error when accessing variable.',
				message: error
			};
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.controller('HeaderController', HeaderController);

	HeaderController.$inject = ['user'];
	function HeaderController(user) {
		this.user = user;
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('headerService', headerService);

	headerService.$inject = ['$http', '$log', 'sessionService'];
	function headerService($http, $log, sessionService) {
		return {
			getUser: getUser
		};

		function getUser() {
			return sessionService.getVar('name')
				.then(getNameComplete);

			function getNameComplete(response) {
				var res = response.data;

				if (res.success === false) {
					return {name: false, url: '#/login'};
				}
				return {name: res.data, url: '#/dashboard'};
			}
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.controller('SidebarController', SidebarController);

	SidebarController.$inject = ['labels', 'calendars'];
	function SidebarController(labels, calendars) {
		var vm = this;
		vm.collapsed = true;
		vm.labels = labels;
		vm.calendars = calendars;
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.controller('EventsController', EventsController);

	EventsController.$inject = ['moment', 'calendarWidgetService', 'eventsService', 'eventModalService'];
	function EventsController(moment, calendarWidgetService, eventsService, eventModalService) {
		var vm = this;
		vm.today = null;
		vm.selectedDay = null;
		vm.month = null;

		vm.isSameDayAsSelected = isSameDayAsSelected;
		vm.getEndOfDay = getEndOfDay;
		vm.selectDay = selectDay;
		vm.showEventModal = showEventModal;
		vm.lastMonth = lastMonth;
		vm.nextMonth = nextMonth;

		activate();

		function activate() {
			vm.today = calendarWidgetService.getToday();
			vm.selectedDay = vm.today;
			vm.month = calendarWidgetService.getMonth(vm.today);
		}

		function getEndOfDay(day) {
			return calendarWidgetService.getEndOfDay(day);
		}

		function isSameDayAsSelected(day) {
			return calendarWidgetService.isSameDay(day, vm.selectedDay);
		}

		function selectDay(day) {
			vm.selectedDay = day.fullDate;
		}

		function showEventModal(event) {
			eventModalService.openEventModal(event, vm.calendars).then(updateEvents);
		}

		function lastMonth() {
			vm.month = calendarWidgetService.lastMonth(vm.month);
		}

		function nextMonth() {
			vm.month = calendarWidgetService.nextMonth(vm.month);
		}

		function updateEvents(response) {
			if (response) {
				vm.events = response;
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.directive('spEvents', eventsDirective);

	function eventsDirective() {
		return {
			templateUrl: 'modules/events/events.html',
			controller: 'EventsController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				events: '=',
				calendars: '='
			}
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('eventsService', eventsService);

	eventsService.$inject = ['$http', '$log', 'crudService', 'sessionService'];
	function eventsService($http, $log, crudService, sessionService) {
		var vm = this;  // jshint ignore:line
		vm.event = new crudService('event');

		return {
			createEvent: createEvent,
			createOrUpdateEvent: createOrUpdateEvent,
			deleteEvent: deleteEvent,
			getEvents: getEvents,
			updateEvent: updateEvent
		};

		function createEvent(event) {
			return vm.event.create(event).then(promiseComplete);
		}

		function createOrUpdateEvent(event) {
			if (!event.event_id) {
				return createEvent(event);
			}
			return updateEvent(event.event_id, event);
		}

		function deleteEvent(id) {
			return vm.event.remove(id).then(promiseComplete);
		}

		function getEvents() {
			return sessionService.getVar('id')
				.then(getEventWithUserID);

			function getEventWithUserID(response) {
				var res = response.data;
				if (res.success) {
					return vm.event.getWhere('', res.data).then(promiseComplete);
				}
				return res.title;
			}
		}

		function updateEvent(id, event) {
			return vm.event.update(id, event).then(promiseComplete);
		}

		function promiseComplete(response) {
			var res = response.data;
			if (res.success) {
				return res.data;
			}
			return res.title;
		}
	}
})();

(function() {
	'use strict';

	/**
	* To be used in conjunction with autofocus attribute to auto-focus
	* modal inputs.
	*/

	angular
		.module('app')
		.directive('spAutoFocus', autoFocusDirective);

	function autoFocusDirective() {
		return {
			restrict: 'A',
			link: link
		};

		function link(scope, element, attrs, ngModel) {
			element[0].focus();
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
		.directive('spCompareTo', compareToDirective);

	function compareToDirective() {
		return {
			require: 'ngModel',
			scope: {
				otherModel: '=spCompareTo'
			},
			link: link
		};

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

		/**
		* LoginService will redirect if there is no error. Thus, there's only a
		* need to return a promise if there's an error.
		*/
		function login() {
			vm.loading = true;
			loginService.login(vm.user)
				.then(function(response) {
					vm.loading = false;
					vm.error = response;
				});
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
			return $http.post('api/user/loginManager.php', user)
				.then(loginComplete)
				.catch(loginFailed);

			function loginComplete(response) {
				if (response.data.success === false) {
					return response.data.title;
				}
				$location.path('/dashboard');
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
		.controller('ModalController', ModalController);

	ModalController.$inject = ['$uibModalInstance', 'groups', 'item'];
	function ModalController($uibModalInstance, groups, item) {
		var vm = this;
		vm.groups = groups;
		vm.item = item;

		vm.cancel = cancel;
		vm.close = close;
		vm.confirm = confirm;
		vm.remove = remove;

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}

		function close() {
			$uibModalInstance.close();
		}

		function confirm(data) {
			$uibModalInstance.close(data);
		}

		function remove(data) {
			$uibModalInstance.dismiss(data);
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.controller('RecurrenceController', RecurrenceController);

	RecurrenceController.$inject = ['recurrenceModalService'];
	function RecurrenceController(recurrenceModalService) {
		var rc = this;
		rc.showRecurrenceModal = showRecurrenceModal;

		function showRecurrenceModal() {
			if (rc.item.recurrence) {
				recurrenceModalService.openRecurrenceModal(rc.item);
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.directive('spRepeat', recurrenceDirective);

	function recurrenceDirective() {
		return {
			templateUrl: 'modules/recurrence/recurrence.html',
			controller: 'RecurrenceController',
			controllerAs: 'rc',
			bindToController: true,
			scope: {
				item: '='
			}
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('recurrenceService', recurrenceService);

	function recurrenceService() {
		var recurrenceCols = {
			freq: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
			days: ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'],
			by: ['by_hour', 'by_day', 'by_month_day', 'by_year_day', 'by_week_no', 'by_month']
		};

		return {
			clearRecurrence: clearRecurrence,
			constructRecurrence: constructRecurrence
		};

		function clearRecurrence(item) {
			item.recurrence = false;
		}

		function constructRecurrence(item) {

		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.controller('TasksController', TasksController);

	TasksController.$inject = ['tasksService', 'taskModalService'];
	function TasksController(tasksService, taskModalService) {
		var vm = this;
		vm.showTaskModal = showTaskModal;
		vm.toggleCompleted = toggleCompleted;

		function showTaskModal(task) {
			taskModalService.openTaskModal(task, vm.labels).then(updateTasks);
		}

		function toggleCompleted(task) {
			tasksService.toggleCompleted(task).then(updateTasks);
		}

		function updateTasks(response) {
			if (response) {
				vm.tasks = response;
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.directive('spTasks', tasksDirective);

	tasksDirective.$inject = ['$filter'];
	function tasksDirective($filter) {
		return {
			templateUrl: 'modules/tasks/tasks.html',
			controller: 'TasksController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				tasks: '=',
				labels: '=',
				order: '=',
				days: '=withinDays'
			}
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('tasksService', tasksService);

	tasksService.$inject = ['$http', '$log', 'crudService', 'sessionService'];
	function tasksService($http, $log, crudService, sessionService) {
		var vm = this;  // jshint ignore:line
		vm.task = new crudService('task');

		return {
			createTask: createTask,
			createOrUpdateTask: createOrUpdateTask,
			deleteTask: deleteTask,
			getTasks: getTasks,
			toggleCompleted: toggleCompleted,
			updateTask: updateTask
		};

		function createTask(task) {
			return vm.task.create(task).then(promiseComplete);
		}

		function createOrUpdateTask(task) {
			if (!task.task_id) {
				return createTask(task);
			}
			return updateTask(task.task_id, task);
		}

		function deleteTask(id) {
			return vm.task.remove(id).then(promiseComplete);
		}

		function getTasks() {
			return sessionService.getVar('id')
				.then(getTaskWithUserID);

			function getTaskWithUserID(response) {
				var res = response.data;
				if (res.success) {
					return vm.task.getWhere('', res.data).then(promiseComplete);
				}
				return res.title;
			}
		}

		function toggleCompleted(task) {
			task.completed = !parseInt(task.completed);
			return updateTask(task.task_id, task).then(getTasks);
		}

		function updateTask(id, task) {
			return vm.task.update(id, task).then(promiseComplete);
		}

		function promiseComplete(response) {
			var res = response.data;
			if (res.success) {
				return res.data;
			}
			return res.title;
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.factory('accessService', accessService);

	accessService.$inject = ['$location', '$q', 'sessionService', 'statusService'];
	function accessService($location, $q, sessionService, statusService) {
		var deferred = $q.defer();

		return {
			isAuthenticated: isAuthenticated,
			isAdmin: isAdmin
		};

		function isAuthenticated() {
			return sessionService.getVar('name')
				.then(isAuthenticatedComplete);

			function isAuthenticatedComplete(response) {
				if (response.data.success !== false) {
					deferred.resolve(statusService.OK);
				} else {
					deferred.reject(statusService.UNAUTHORIZED);
				}

				return deferred.promise;
			}
		}

		function isAdmin() {

		}
	}
})();

(function() {
	'use strict';

	/**
	* Status codes used when accessing various pages in the app.
	*/

	angular
		.module('app')
		.service('statusService', statusService);

	function statusService() {
		return {
			OK: 200,
			UNAUTHORIZED: 401,
			FORBIDDEN: 403
		};
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.controller('UploadController', UploadController);

	UploadController.$inject = ['$scope', '$http', 'uploadService'];
	function UploadController($scope, $http, uploadService) {
		var uc = this;
		uc.uploadFile = uploadFile;

		function uploadFile(file, oldFile) {
			return uploadService.uploadFile(file)
				.then(function(filePath) { return filePath; });
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.directive('spFileChange', uploadDirective);

	uploadDirective.$inject = ['$parse'];
	function uploadDirective($parse) {
		return {
			restrict: 'A',
			controller: 'UploadController',
			controllerAs: 'uc',
			link: link,
			scope: {
				spFileChange: '=',
			}
		};

		function link(scope, element, attrs) {
			var maxFileSize = 2 * 1024 * 1024;
			var fileModel = $parse(attrs.spFileChange);
			element[0].addEventListener('change', fileHandler, false);

			function fileHandler(event) {
				scope.$apply(function() {
					var file = element[0].files[0];

					if (file.size <= maxFileSize) {
						scope.uc.uploadFile(file)
							.then(function(filePath) { scope.spFileChange = filePath; });
					} else {
						alert("File must be less than " + (maxFileSize / 1024 / 1024) + "MB.");// jshint ignore:line
					}
				});
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('uploadService', uploadService);

	uploadService.$inject = ['$http', '$log'];
	function uploadService($http, $log) {
		return {
			uploadFile: uploadFile
		};

		function uploadFile(file) {
			var formData = new FormData();
			formData.append('file', file);

			return $http.post('api/upload/uploadManager.php', formData, {
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined }
			})
				.then(function(res) {
					if (res.data.success) {
						return res.data.data;
					}
					$log.error(res.title);
					return '';
				})
				.catch(function(res) {
					$log.error(res);
				});
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('calendarService', calendarService);

	calendarService.$inject = ['$http', '$log', 'crudService', 'sessionService'];
	function calendarService($http, $log, crudService, sessionService) {
		var vm = this;  // jshint ignore:line
		vm.calendar = new crudService('calendar');

		return {
			createCalendar: createCalendar,
			deleteCalendar: deleteCalendar,
			getCalendars: getCalendars,
			updateCalendar: updateCalendar
		};

		function createCalendar(calendar) {
			return vm.calendar.create(calendar).then(promiseComplete);
		}

		function deleteCalendar(id) {
			return vm.calendar.remove(id).then(promiseComplete);
		}

		function getCalendars() {
			return sessionService.getVar('id')
				.then(getCalendarWithUserID);

			function getCalendarWithUserID(response) {
				var res = response.data;
				if (res.success) {
					return vm.calendar.getWhere('person_id=' + res.data, '').then(promiseComplete);
				}
				return res.title;
			}
		}

		function updateCalendar(id, calendar) {
			return vm.calendar.update(id, calendar).then(promiseComplete);
		}

		function promiseComplete(response) {
			var res = response.data;
			if (res.success) {
				return res.data;
			}
			return res.title;
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.factory('eventModalService', eventModalService);

	eventModalService.$inject = ['$uibModal', 'calendarService', 'eventsService'];
	function eventModalService($uibModal, calendarService, eventsService) {
		var vm = this;  // jshint ignore:line

		return {
			openEventModal: openEventModal
		};

		function openEventModal(event, calendars) {
			return $uibModal.open({
				controller: 'ModalController',
				controllerAs: 'vm',
				templateUrl: 'modules/events/modal/event.modal.html',
				resolve: {
					groups: function() { return calendars; },
					item: event
				}
			}).result
				.then(function(response) {
					return eventsService.createOrUpdateEvent(response)
						.then(eventsService.getEvents);
				}, function(response) {
					if (typeof response !== 'string') {
						return eventsService.deleteEvent(response)
							.then(eventsService.getEvents);
					}
				});
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.factory('calendarWidgetService', calendarWidgetService);

	calendarWidgetService.$inject = ['moment'];
	function calendarWidgetService(moment) {
		return {
			getEndOfDay: getEndOfDay,
			getMonth: getMonth,
			getToday: getToday,
			getWeek: getWeek,
			isSameDay: isSameDay,
			lastMonth: lastMonth,
			nextMonth: nextMonth
		};

		function getEndOfDay(day) {
			return day.clone().add(1, 'day').subtract(1, 'ms');
		}

		/**
		* @param {Moment Object} aDay Day to build month around.
		* @return {Moment Object[][]}
		*/
		function getMonth(aDay) {
			var month = [];
			var day = aDay.clone().date(1).startOf('week');
			for (var i = 0; i < 6; i++) {
				month.push(getWeek(day, aDay.month()));
				day = day.add(1, 'weeks');
			}
			return month;
		}

		function getToday() {
			return moment();
		}

		/**
		* @param {Moment Object}	startDay	Starting day of a week.
		* @param {int}				targetMonth	Month number being built.
		*
		* @return {Moment Object[]}
		*/
		function getWeek(startDay, targetMonth) {
			var week = [];

			var day = startDay.clone();
			for (var i = 0; i < 7; i++) {
				week.push({
					number: day.date(),
					isTargetMonth: (day.month() === targetMonth),
					isToday: day.isSame(moment(), 'day'),
					fullDate: day
				});
				day = day.clone().add(1, 'days');
			}

			return week;
		}

		/**
		* @param {Moment Object}	day1
		* @param {Moment Object}	day2
		*
		* @return {bool}
		*/
		function isSameDay(day1, day2) {
			return day1.isSame(day2, 'day');
		}

		/**
		* Since srcMonth is an array of days by weeks, it contains days not in the
		* source month. The first day of the third week of the given month is
		* guaranteed to be a day within the source month.
		*
		* @param {Moment Object}	srcMonth
		* @return {Moment Object[]}
		*/
		function lastMonth(srcMonth) {
			return getMonth(srcMonth[3][0].fullDate.clone().subtract(1, 'months'));
		}

		/**
		* @see lastMonth()
		*/
		function nextMonth(srcMonth) {
			return getMonth(srcMonth[3][0].fullDate.clone().add(1, 'months'));
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.factory('recurrenceModalService', recurrenceModalService);

	recurrenceModalService.$inject = ['$uibModal', 'recurrenceService'];
	function recurrenceModalService($uibModal, recurrenceService) {
		var rc = this; // jshint ignore: line
		var recurrenceInfo = {
			freq: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
			days: ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
		};

		return {
			openRecurrenceModal: openRecurrenceModal
		};

		function openRecurrenceModal(item) {
			return $uibModal.open({
				controller: 'ModalController',
				controllerAs: 'vm',
				templateUrl: 'modules/recurrence/modal/recurrence.modal.html',
				resolve: {
					groups: function() { return recurrenceInfo; },
					item: item
				}
			}).result
				.then(function(response) {
					recurrenceService.constructRecurrence(item);
				}, function(response) {
					recurrenceService.clearRecurrence(item);
				});
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.factory('labelService', labelService);

	labelService.$inject = ['$http', '$log', 'crudService', 'sessionService'];
	function labelService($http, $log, crudService, sessionService) {
		var vm = this;  // jshint ignore:line
		vm.label = new crudService('label');

		return {
			createLabel: createLabel,
			deleteLabel: deleteLabel,
			getLabels: getLabels,
			updateLabel: updateLabel
		};

		function createLabel(label) {
			return vm.label.create(label).then(promiseComplete);
		}

		function deleteLabel(id) {
			return vm.label.remove(id).then(promiseComplete);
		}

		function getLabels() {
			return sessionService.getVar('id')
				.then(getLabelWithUserID);

			function getLabelWithUserID(response) {
				var res = response.data;
				if (res.success) {
					return vm.label.getWhere('person_id=' + res.data, '').then(promiseComplete);
				}
				return res.title;
			}
		}

		function updateLabel(id, label) {
			return vm.label.update(id, label).then(promiseComplete);
		}

		function promiseComplete(response) {
			var res = response.data;
			if (res.success) {
				return res.data;
			}
			return res.title;
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.factory('subtaskModalService', subtaskModalService);

	subtaskModalService.$inject = ['$uibModal', 'labelService', 'subtasksService'];
	function subtaskModalService($uibModal, labelService, subtasksService) {
		return {
			openSubtaskModal: openSubtaskModal
		};

		function openSubtaskModal(subtask, task) {
			$uibModal.open({
				controller: 'ModalController',
				controllerAs: 'vm',
				templateUrl: 'modules/tasks/modal/subtask.modal.html',
				resolve: {
					groups: task,
					item: subtask
				}
			}).result
				.then(function(res) {
					subtasksService.createOrUpdateSubtask(res.subtask, res.task);
				}, function(res) {
					if (typeof res !== 'string') {
						subtasksService.deleteSubtask(res.subtask, res.task);
					}
				});
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.factory('taskModalService', taskModalService);

	taskModalService.$inject = ['$uibModal', 'labelService', 'tasksService'];
	function taskModalService($uibModal, labelService, tasksService) {
		var vm = this; // jshint ignore: line

		return {
			openTaskModal: openTaskModal
		};

		function openTaskModal(task, labels) {
			return $uibModal.open({
				controller: 'ModalController',
				controllerAs: 'vm',
				templateUrl: 'modules/tasks/modal/task.modal.html',
				resolve: {
					groups: function() { return labels; },
					item: task
				}
			}).result
				.then(function(response) {
					return tasksService.createOrUpdateTask(response)
						.then(tasksService.getTasks);
				}, function(response) {
					if (typeof response !== 'string') {
						return tasksService.deleteTask(response)
							.then(tasksService.getTasks);
					}
				});
		}
	}
})();

(function() {
	'use strict';

	angular
		.module('app')
		.controller('SubtasksController', SubtasksController);

	SubtasksController.$inject = ['subtasksService', 'subtaskModalService'];
	function SubtasksController(subtasksService, subtaskModalService) {
		var st = this;
		st.showSubtaskModal = showSubtaskModal;
		st.toggleCompleted = toggleCompleted;

		function showSubtaskModal(subtask) {
			subtaskModalService.openSubtaskModal(subtask, st.task);
		}

		function toggleCompleted(subtask) {
			subtasksService.toggleCompleted(subtask);
		}

		function updateSubtasks(response) {
			if (response) {
				st.subtasks = response;
			}
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.directive('spSubtasks', subtasksDirective);

	function subtasksDirective() {
		return {
			templateUrl: 'modules/tasks/subtasks/subtasks.html',
			controller: 'SubtasksController',
			controllerAs: 'st',
			bindToController: true,
			scope: {
				task: '='
			}
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('app')
		.factory('subtasksService', subtasksService);

	subtasksService.$inject = ['$http', '$log'];
	function subtasksService($http, $log) {
		return {
			createOrUpdateSubtask: createOrUpdateSubtask,
			deleteSubtask: deleteSubtask,
			toggleCompleted: toggleCompleted
		};

		function createOrUpdateSubtask(subtask, task) {
			if (!task.subtasks) {
				task.subtasks = {
					currentId: 1,
					list: []
				};
			}

			if (subtask.id === undefined) {
				subtask.id = task.subtasks.currentId++;
				subtask.completed = false;
				task.subtasks.list.push(subtask);
			}
		}

		function deleteSubtask(subtask, task) {
			task.subtasks.list.splice(task.subtasks.list.indexOf(subtask), 1);
		}

		function toggleCompleted(subtask) {
			subtask.completed = !subtask.completed;
		}
	}
})();
