//@auth @req(action, envName)

var a = action + '', c = jelastic.env.control, e = envName, s = session, r, s;
s = c.GetEnvInfo(e, session).env.status;

switch (a) {
    case 'start': 
        if (s == 2 || s ==4) {
            r = c.StartEnv(e, s); 
        }
        break;
    case 'stop': 
        if (s == 1) {
            r = c.StopEnv(e, s, -1);
        }
        break;
    case 'sleep': r = c.SleepEnv(e, s); break;
    default: r = {result: 99, error: 'unknown action [' + a + ']'}
}

return r;
