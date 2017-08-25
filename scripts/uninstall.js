//@auth @req(name)

jelastic.dev.scripting.DeleteScript(name);

var tasks = jelastic.utils.scheduler.GetTasks({ appid: appid, session: session }).objects;
for (var i = 0, l = tasks.length; i < l; i++) 
  if (tasks[i].script == name) jelastic.utils.scheduler.RemoveTask(tasks[i].id);

return {result:0}
