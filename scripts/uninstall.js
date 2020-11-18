//@auth @req(name)

jelastic.dev.scripting.DeleteScript({appid: appid, session: session, name: name});
jelastic.dev.scripting.DeleteScript({appid: appid, session: session, name: "uninstall-" + name});

var tasks = jelastic.utils.scheduler.GetTasks({appid: appid, session: session}).objects;
for (var i = 0, l = tasks.length; i < l; i++) 
  if (tasks[i].script.indexOf(name) > -1) jelastic.utils.scheduler.RemoveTask({appid: appid, session:session, id: tasks[i].id});


return {result:0}
