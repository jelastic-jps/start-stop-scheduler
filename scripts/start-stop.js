//@auth @req(action, envName)
import com.hivext.api.server.system.service.utils.EnvironmentStatus;

var execAction = action + '', c = jelastic.env.control, e = envName, s = session, result, status, resp,
    DOWN = 'ENV_STATUS_TYPE_DOWN',
    SLEEP = 'ENV_STATUS_TYPE_SLEEP',
    RUNNING = 'ENV_STATUS_TYPE_RUNNING',
    description = "start-stop-scheduler";

resp = c.GetEnvInfo(e, s);
if (resp.result != 0) return resp;

status = resp.env.status;
api.marketplace.console.WriteLog("action->" + execAction);
switch (execAction) {
    case 'start': 
        if (status == EnvironmentStatus[DOWN].getValue() || 
            status == EnvironmentStatus[SLEEP].getValue()) {
            result = c.StartEnv(e, s);
            api.marketplace.console.WriteLog("StartEnv result->" + result);
            if (result != 0) return createRetryTask();
        }
        break;
    case 'stop': 
        if (status == EnvironmentStatus[RUNNING].getValue()) {
            result = c.StopEnv(e, s, -1);
            api.marketplace.console.WriteLog("StopEnv result->" + result);
            if (result != 0) return createRetryTask();
        }
        break;
    case 'sleep': result = c.SleepEnv(e, s); break;
    default: result = {result: 99, error: 'unknown action [' + execAction + ']'}
}

function createRetryTask() {
    var params = toJSON({
        action: execAction,
        envName: envName,
        envAppid: envAppid
    });
    api.marketplace.console.WriteLog("createRetryTask params->" + params);
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
    message: "Unable to " + execAction + " environment, status is "+ status
};
