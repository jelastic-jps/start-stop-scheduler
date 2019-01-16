//@auth @req(action, envName)
import com.hivext.api.server.system.service.utils.EnvironmentStatus;

var a = action + '', c = jelastic.env.control, e = envName, s = session, r, status, resp,
    DOWN = 'ENV_STATUS_TYPE_DOWN',
    SLEEP = 'ENV_STATUS_TYPE_SLEEP',
    RUNNING = 'ENV_STATUS_TYPE_RUNNING';

resp = c.GetEnvInfo(e, s);
if (resp.result != 0) return resp;

status = resp.env.status;

switch (a) {
    case 'start': 
        if (status == EnvironmentStatus[DOWN].getValue() || 
            status == EnvironmentStatus[SLEEP].getValue()) {
            r = c.StartEnv(e, s); 
        }
        break;
    case 'stop': 
        if (status == EnvironmentStatus[RUNNING].getValue()) {
            r = c.StopEnv(e, s, -1);
        }
        break;
    case 'sleep': r = c.SleepEnv(e, s); break;
    default: r = {result: 99, error: 'unknown action [' + a + ']'}
}

return r || {
    result: 0,
    message: "Unable to " + a + " environment, status is "+ status 
};
