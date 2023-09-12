//@auth @req(action, envName)
import com.hivext.api.server.system.service.utils.EnvironmentStatus;

var action = action + '', c = jelastic.env.control, e = envName, s = session, result, status, resp,
    DOWN = 'ENV_STATUS_TYPE_DOWN',
    SLEEP = 'ENV_STATUS_TYPE_SLEEP',
    RUNNING = 'ENV_STATUS_TYPE_RUNNING',
    description = "start-stop-scheduler";

resp = c.GetEnvInfo(e, s);
if (resp.result != 0) return resp;

status = resp.env.status;

switch (action) {
    case 'start': 
        if (status == EnvironmentStatus[DOWN].getValue() || 
            status == EnvironmentStatus[SLEEP].getValue()) {
            result = c.StartEnv(e, s);
            if (result != 0) return createRetryTask();
        }
        break;
    case 'stop': 
        if (status == EnvironmentStatus[RUNNING].getValue()) {
            result = c.StopEnv(e, s, -1);
            if (result != 0) return createRetryTask();
        }
        break;
    case 'sleep': result = c.SleepEnv(e, s); break;
    default: result = {result: 99, error: 'unknown action [' + action + ']'}
}

function createRetryTask() {
    var params = toJSON({
        action: action,
        envName: envName,
        envAppid: envAppid
    })
    var targetAppid = api.dev.apps.CreatePersistence ? envAppid : appid;
    return jelastic.utils.scheduler.CreateEnvTask({
        appid: targetAppid,
        envName: envName,
        session: session,
        script: name + "-start-stop",
        trigger: "once_delay:10000",
        description: description,
        params: params
    });
}

return result || {
    result: 0,
    message: "Unable to " + action + " environment, status is "+ status
};
