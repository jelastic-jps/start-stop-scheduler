//@req(start, stop, name)
import org.json.JSONObject;

var description = "start-stop-scheduler",
    action,
    tasks,
    resp;

resp = jelastic.utils.scheduler.GetTasks();
if (resp.result != 0) return resp;

tasks = resp.objects;
for (var i = 0, l = tasks.length; i < l; i += 1) {
    if (tasks[i].script == name) {
        
        if (start) {
            resp = replaceTask(tasks[i], 'start', start)
            if (resp.result != 0) return resp;
        }
        
        if (stop) {
            resp = replaceTask(tasks[i], 'stop', stop)
            if (resp.result != 0) return resp;
        }
    }
}

function replaceTask (task, taskName, newTask) {
    action = toNative(new JSONObject(task.params.replace('\\\\', '\\'))).action
    
    if (action == taskName && task.trigger.indexOf(newTask) == -1) {
        resp = jelastic.utils.scheduler.RemoveTask(task.id);
        if (resp.result != 0) return resp;
        
        return addTask(newTask, taskName);
    }
    
    return {
        result: 0
    };
}

function addTask (action, taskName){
    var params = toJSON({action: taskName, envName: '${env.envName}'});
    return jelastic.utils.scheduler.AddTask(appid, session, name, "cron:" + action, description, params);
}

return {
    result: 0
};
