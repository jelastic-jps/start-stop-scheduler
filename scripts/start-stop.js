//@auth @req(action, envName)

var a = action + '', c = jelastic.env.control, e = envName, s = session, r, status;
status = c.GetEnvInfo(e, s).env.status;

switch (a) {
    case 'start': 
        if (status == 2 || status ==4) {
            r = c.StartEnv(e, s); 
        }
        break;
    case 'stop': 
        if (status == 1) {
            r = c.StopEnv(e, s, -1);
        }
        break;
    case 'sleep': r = c.SleepEnv(e, s); break;
    default: r = {result: 99, error: 'unknown action [' + a + ']'}
}

return r || {
    result: 0
};
