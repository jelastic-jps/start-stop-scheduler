//@auth 
//@req(name)

api.dev.scripting.DeleteScript({ name: name });
api.dev.scripting.DeleteScript({ name: "uninstall-" + name });

var resp = api.utils.scheduler.GetTasks();
if (resp.result != 0) return resp;

var tasks = resp.objects;
var delTasks = [];

for (var i = 0, l = tasks.length; i < l; i++) {
    if (tasks[i].script == name) delTasks.push(tasks[i].id); 
}

resp = { result:0 };

if (delTasks.length > 0) {
    resp.deletedTaskIds = delTasks;
    resp.response = api.utils.scheduler.DeleteTasks({ ids: delTasks });
}

return resp;
