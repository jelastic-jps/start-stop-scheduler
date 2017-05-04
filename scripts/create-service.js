//@auth
//@req(url, name)

import com.hivext.api.core.utils.Transport;

var description = "start-stop-scheduler", resp, tasks;

if (!getParam('update')) {
    //delete the script if it exists already
    jelastic.dev.scripting.DeleteScript(name);

    //reading script from URL
    var body = new Transport().get(url);

    //create a new script 
    resp = jelastic.dev.scripting.CreateScript(name, 'js', body);
    if (resp.result != 0) return resp;
}

resp = jelastic.utils.scheduler.GetTasks();
if (resp.result != 0) return resp;

tasks = resp.objects;
for (var i = 0, l = tasks.length; i < l; i++) 
    if (tasks[i].script == name) jelastic.utils.scheduler.RemoveTask(tasks[i].id);

var startCron = getParam('start'),
    stopCron = getParam('stop');
    
if (startCron) {
    resp = addTask(startCron, 'start')
    if (resp.result != 0) return resp;
}

return stopCron ? addTask(stopCron, 'stop') : resp

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
