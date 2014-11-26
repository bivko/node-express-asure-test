var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var moment = require('moment');

// Implement azure storage
var azure = require('azure-storage');
var nconf = require('nconf');

nconf.env().file({
    file: 'config.json'
});

var tableName = nconf.get("TABLE_NAME");
var tableLogName = nconf.get("TABLE_LOG_NAME");
var partitionKey = nconf.get("PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");

var TaskRoute = require('./routes/index');
var TaskModel = require('./models/task');
var task = new TaskModel(azure.createTableService(accountName, accountKey), tableName, partitionKey);
var taskList = new TaskRoute(task);

var CompletedRoute = require('./routes/completed');
var completedList = new CompletedRoute(task);

var azureTable = require('azure-table-node');

azureTable.setDefaultClient({
    accountUrl: nconf.get("STORAGE_URL"),
    accountName: nconf.get('STORAGE_NAME'),
    accountKey: nconf.get("STORAGE_KEY"),
    pool:false,
    retry:false,
    forever:false
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', taskList.showTasks.bind(taskList));
app.get('/task', taskList.editTasks.bind(taskList));
app.post('/addtask', taskList.addTask.bind(taskList));
app.post('/edittask', taskList.editTask.bind(taskList));
app.post('/completetask', taskList.completeTask.bind(taskList));

app.get('/completed/', completedList.showTasks.bind(completedList));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
