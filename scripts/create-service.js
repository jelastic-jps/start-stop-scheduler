//@auth
//@req(url, name)

import com.hivext.api.core.utils.Transport;
import org.json.JSONObject;

var description = "start-stop-scheduler",
    //reading script from URL
    body = new Transport().get(url),
    configureAction = 'action',
    startText = 'start',
    stopText = 'stop',
    checkTask,
    tasks,
    start,
    stop,
    task,
    resp,
    i, l

start = getParam(startText)
stop = getParam(stopText)

//delete the script if it exists already
jelastic.dev.scripting.DeleteScript(name);

//create a new script 
resp = jelastic.dev.scripting.CreateScript(name, 'js', body);
if (resp.result != 0) return resp;

resp = jelastic.utils.scheduler.GetTasks();
if (resp.result != 0) return resp;

tasks = resp.objects;

if (getParam(configureAction)) {

    if (start) {
        resp = replaceTask(tasks, startText, start)
        if (resp.result != 0) return resp;
    }

    return stop ? replaceTask(tasks, stopText, stop) : resp
} else {
    
    if (start) {
        resp = addTask(start, startText)
        if (resp.result != 0) return resp;
    }

    return stop ? addTask(stop, stopText) : resp
}

function replaceTask(tasks, taskName, newTask) {
    for (i = 0, l = tasks.length; i < l; i++) {
        action = toNative(new JSONObject(tasks[i].params.replace('\\\\', '\\'))).action
        checkTask = newTask.substring(0, newTask.length -1)
        // check an identical tasks
        if (action == taskName && tasks[i].trigger.indexOf(checkTask) == -1) {
            // remove task
            resp = jelastic.utils.scheduler.RemoveTask(tasks[i].id);
            if (resp.result != 0) return resp;
            // add new task    
            return addTask(newTask, taskName);
        }
    }
    return {
        result: 0
    };
}
    
function addTask (action, taskName) {
    //trim string
    var arr = action.replace(/\s+/g, ' ').replace(/^\s+|\s+$/gm,'').split(' ');
    //should be 5 elements
    if (arr.length != 5) return {result: 99, message:'wrong cron format [' + action + ']', type: 'error'}
    //replacing * at "Day of week" to make it compatible with quartz format 
    if (arr[4] == '*') arr[4] = '?';
    //adding seconds - always 0
    arr.unshift('0');
    action = arr.join(' ');
    
    var params = toJSON({action: taskName, envName: '${env.envName}'});
    return jelastic.utils.scheduler.AddTask(appid, session, name, "cron:" + action, description, params);
}

return {
    result: 0
};
