//@auth @req(name)

jelastic.dev.scripting.DeleteScript({appid: appid, session: session, name: name});
jelastic.dev.scripting.DeleteScript({appid: appid, session: session, name: "uninstall-" + name});

var tasks = jelastic.utils.scheduler.GetTasks({appid: appid, session: session}).objects;
var delTasks = [];
for (var i = 0, l = tasks.length; i < l; i++) {
    if (tasks[i].script == name) delTasks.push(tasks[i].id); 
}
if (delTasks.length) jelastic.utils.scheduler.DeleteTasks({appid: appid, session:session, ids: delTasks});

return {result:0}
