//@auth
//@req(url, name, cron)

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
    
var resp = jelastic.utils.scheduler.AddTask(name, "cron:" + cron, description, "{action: 'start'}");
return resp;
