//@auth @req(name)

jelastic.dev.scripting.DeleteScript({session: session, name:name});

var tasks = jelastic.utils.scheduler.GetTasks({session: session}).objects;
for (var i = 0, l = tasks.length; i < l; i++) 
  if (tasks[i].script == name) jelastic.utils.scheduler.RemoveTask({session:session, id: tasks[i].id});


return {result:0}
