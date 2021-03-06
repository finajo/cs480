// Karma configuration
module.exports = function(config) {
	config.set({

	basePath: '../',

	frameworks: ['jasmine'],

	files: [
		'node_modules/jquery/dist/jquery.js',
		'node_modules/angular/angular.js',
		'node_modules/angular-route/angular-route.js',
		'node_modules/angular-mocks/angular-mocks.js',
		'client/app/main.js',
		'test/unit/**/*.js'
	],

	reporters: ['spec'],

	port: 9876,

	colors: true,

	logLevel: config.LOG_INFO,

	autoWatch: true,

	browsers: ['PhantomJS'],

	singleRun: false,

	concurrency: Infinity,

	plugins : [
		'karma-firefox-launcher',
		'karma-phantomjs-launcher',
		'karma-spec-reporter',
		'karma-jasmine'
	]

  });
};
