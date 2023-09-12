//@auth @req(action, envName)
import com.hivext.api.server.system.service.utils.EnvironmentStatus;

var execAction = action + '', c = jelastic.env.control, e = envName, s = session, resp, status, resp,
    DOWN = 'ENV_STATUS_TYPE_DOWN',
    SLEEP = 'ENV_STATUS_TYPE_SLEEP',
    RUNNING = 'ENV_STATUS_TYPE_RUNNING',
    description = "start-stop-scheduler";

resp = c.GetEnvInfo(e, s);
if (resp.result != 0) return resp;

status = resp.env.status;

switch (execAction) {
    case 'start': 
        if (status == EnvironmentStatus[DOWN].getValue() || 
            status == EnvironmentStatus[SLEEP].getValue()) {
            resp = c.StartEnv(e, s);
            if (resp.result != 0) return createRetryTask();
        }
        break;
    case 'stop': 
        if (status == EnvironmentStatus[RUNNING].getValue()) {
            resp = c.StopEnv(e, s, -1);
            if (resp.result != 0) return createRetryTask();
        }
        break;
    case 'sleep': resp = c.SleepEnv(e, s); break;
    default: resp = {result: 99, error: 'unknown action [' + execAction + ']'}
}

function createRetryTask() {
    var params = toJSON({
        action: execAction,
        envName: envName,
        envAppid: envAppid
    });

    return jelastic.utils.scheduler.CreateEnvTask({
        appid: api.dev.apps.CreatePersistence ? envAppid : appid,
        envName: envName,
        session: session,
        script: name + "-start-stop",
        trigger: "once_delay:10000",
        description: description,
        params: params
    });
}

return resp || {
    result: 0,
    message: "Unable to " + execAction + " environment, status is "+ status
};
