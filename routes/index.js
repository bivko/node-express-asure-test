var azure = require('azure-storage'),
    async = require('async');

module.exports = TaskRoute;

function TaskRoute(task) {
  this.task = task;
}

TaskRoute.prototype = {
  showTasks: function(req, res) {
    self = this;
    var query = new azure.TableQuery().where('completed eq ?', false);

    self.task.find(query, function itemsFound(error, items) {
      res.render('index',{title: 'My ToDo List ', tasks: items});
    });
  },

  editTasks: function(req, res){
    self = this;
    var key = req.query.key;
    var query = new azure.TableQuery().where('RowKey eq ?', key);

    self.task.find(query, function itemsFound(error, item) {
      res.render('editItem',{title: 'Edit item', task: item[0]});
    });
  },

  addTask: function(req,res) {
    var self = this;
    var item = {
      name: req.body.itemName,
      category: req.body.itemCategory
    };

    self.task.addItem(item, function itemAdded(error) {
      if(error) {
        throw error;
      }
      res.redirect('/');
    });
  },

  editTask: function(req,res){
    var self = this,
      item = {
        name: req.body.name,
        category: req.body.category,
        completed: req.body.completed == 'true' ? true : false
        },
      RowKey = req.body.RowKey;

    self.task.updateItem({
      item: item,
      key: RowKey
    }, function goHome(error){
      if(error) {
        throw error;
      }
      res.redirect('/');
    });
  },

  completeTask: function(req,res) {
    var self = this;
    var completedTasks = Object.keys(req.body);
    async.forEach(completedTasks, function taskIterator(completedTask, callback) {
      self.task.updateItem({key: completedTask}, function itemsUpdated(error) {
        if(error){
          callback(error);
        } else {
          callback(null);
        }
      });
    }, function goHome(error){
      if(error) {
        throw error;
      } else {
        res.redirect('/');
      }
    });
  }
};