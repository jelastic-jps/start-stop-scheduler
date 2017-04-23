//@auth @req(action, envName)

var a = action + '', c = jelastic.env.control, e = envName, s = session, r;
switch (a) {
    case 'start': r = c.StartEnv(e, s); break;
    case 'stop': r = c.StopEnv(e, s, -1); break;
    case 'sleep': r = c.SleepEnv(e, s); break;
    default: r = {result: 99, error: 'unknown action [' + a + ']'}
}
