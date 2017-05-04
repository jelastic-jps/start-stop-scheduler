//@auth
//@req(url, name)

import com.hivext.api.core.utils.Transport;

//reading script from URL
var body = new Transport().get(url),
    startText = 'start',
    stopText = 'stop'

//delete the script if it exists already
jelastic.dev.scripting.DeleteScript(name);

//create a new script 
var resp = jelastic.dev.scripting.CreateScript(name, 'js', body);
if (resp.result !== 0) return resp;

var tasks = jelastic.utils.scheduler.GetTasks().objects;
var description = "start-stop-scheduler";

for (var i = 0, l = tasks.length; i < l; i++){
    var t = tasks[i];
    if (t.script === name) jelastic.utils.scheduler.RemoveTask(t.id);
}
    
var start = getParam(startText),
    stop = getParam(stopText);


function addTask (action, taskName) {
    //trim string
    var arr = action.replace(/\s+/g, " ").replace(/^\s+|\s+$/gm,'').split(' ');
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

if (start) {
    resp = addTask(start, startText);
    if (resp.result !== 0) return resp;
}

return stop ? addTask(stop, stopText) : resp;

