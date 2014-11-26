var azure = require('azure-storage'),
    async = require('async');

module.exports = TaskRoute;

function TaskRoute(task) {
  this.task = task;
}

TaskRoute.prototype = {
  showTasks: function(req, res) {
    self = this;
    var query = new azure.TableQuery().where('completed eq ?', true);

    self.task.find(query, function itemsFound(error, items) {
      res.render('completed',{title: 'My Completed List ', tasks: items});
    });
  }
};