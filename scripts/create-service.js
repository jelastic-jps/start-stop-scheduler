//@auth
//@req(url, name, start, stop)

import com.hivext.api.core.utils.Transport;

//reading script from URL
var body = new Transport().get(url)

//delete the script if it exists already
jelastic.dev.scripting.DeleteScript(name);

//create a new script 
var resp = jelastic.dev.scripting.CreateScript(name, 'js', body);
if (resp.result != 0) return resp;

var tasks = jelastic.utils.scheduler.GetTasks().objects;
var description = "start-stop-scheduler";

for (var i = 0, l = tasks.length; i < l; i++){
    var t = tasks[i];
    //if (t.description == description) 
      jelastic.utils.scheduler.RemoveTask(t.id);
}
    
if (start != '-') {
    var params = toJSON({action: 'start', envName: '${env.envName}'});
    resp = jelastic.utils.scheduler.AddTask(appid, session, name, "cron:" + start, description, params);
    if (resp.result != 0) return resp;
}

if (stop != '-') {
    var params = toJSON({action: 'stop', envName: '${env.envName}'});
    resp = jelastic.utils.scheduler.AddTask(appid, session, name, "cron:" + stop, description, params);
    if (resp.result != 0) return resp;
}

return resp;
