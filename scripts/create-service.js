//@auth
//@req(name)

import com.hivext.api.core.utils.Transport;

var url = getParam('url'),
    description = "start-stop-scheduler",
    resp, tasks, envName = '${env.envName}', envAppid = '${env.appid}', version;

version = jelastic.system.service.GetVersion().version.split("-").shift();

if (url) {
    //reading script from URL
    var body = new Transport().get(url);

    //delete the script if it exists already
    jelastic.dev.scripting.DeleteScript({appid: appid, session: session, name:name});

    //create a new script 
    resp = jelastic.dev.scripting.CreateScript({appid: appid, session: session, name: name, type: 'js', code: body});
    if (resp.result != 0) return buildErrorMessage(resp);
}

resp = jelastic.utils.scheduler.GetTasks({appid: appid, session: session});
if (resp.result != 0) return resp;

tasks = resp.objects;
for (var i = 0, l = tasks.length; i < l; i++)
if (tasks[i].script == name) jelastic.utils.scheduler.RemoveTask({appid: appid, session:session, id: tasks[i].id});

var startCron = getParam('start'),
    stopCron = getParam('stop');

if (startCron) {
    resp = addTask(startCron, 'start')
    if (resp.result != 0) return buildErrorMessage(resp);
}

if (stopCron) {
    resp = addTask(stopCron, 'stop');
}

if (getParam('action') && getParam('action') == 'update') {
    resp.type = 'info';
    return resp;
}

resp.appid = appid;
resp.session = session;

return resp;

function addTask(cron, taskName) {
    var quartz = convert(cron);
    var params = toJSON({
        action: taskName,
        envName: envName
    });

    for (var i = 0, l = quartz.length; i < l; i++) {
        if (compareVersions(version, '5.3') >= 0 || version.indexOf('trunk') != -1) {
            var resp = jelastic.utils.scheduler.CreateEnvTask({appid: appid, envName: envName, session: session, script: name, trigger: "cron:" + quartz[i], description: description, params: params}) 
        } else {
            var resp = jelastic.utils.scheduler.AddTask({appid: appid, session: session, script: name, trigger: "cron:" + quartz[i], description: description, params: params}) 
        }
        if (resp.result != 0) return buildErrorMessage(resp)
    }
    
    return {result: 0}
}

function buildErrorMessage(resp) {
    resp.type = 'error';
    resp.message = resp.error;
    return resp;
}

function compareVersions(a, b) {
   a = a.split("."), b = b.split(".")
   for (var i = 0, l = Math.max(a.length, b.length); i < l; i++) {x = parseInt(a[i], 10) || 0; y = parseInt(b[i], 10) || 0; if (x != y) return x > y ? 1 : -1 }
   return 0;
 }

function convert(cron) {
    //conversion is based on https://github.com/lirantal/cron-to-quartz
    /**
     * Object declaration
     * C2Q - Cron 2 Quartz conversion library
     *
     */
    var C2Q = {};

    /** 
     * Get a Quartz CRON notation from provided Unix CRON syntax
     * getQuartz
     *
     * Expects to get a Unix CRON syntax format, for example: 00 11,13 * * *
     * 
     * @param {string} unix CRON format
     * @return {array} array of arrays
     *   for example:
     *    [ 
     *     ['0', '00', '11,13', '*', '*', '?', '*' ]
     *    ]
     *
     *
     */
    C2Q.getQuartz = function (crontab) {

        var data = [];
        var quartzEntry = [];

        // check for cron magic entries
        quartzEntry = parseCronMagics(crontab);

        if (quartzEntry) {
            data.push(quartzEntry);
        } else {

            // if cron magic entries not found, proceed to parsing normal cron format
            var crontabEntry = crontab.split(' ');
            quartzEntry = parseCronSyntax(crontabEntry);

            data.push(quartzEntry);

            // Quartz doesn't support both DOM and DOW definitions so if we find such ocurrence we'll need to
            // create 2 Quartz entries, one with DOM and one with DOW to create an OR expression
            if (crontabEntry[2] !== '*' && crontabEntry[4] !== '*') {

                // by default, parseCronSyntax() gives priority to parse the DOM first so we reset it now to * to
                // make sure we also have a variant of the CRON expression with DOW
                crontabEntry[2] = '*';

                quartzEntry = parseCronSyntax(crontabEntry);
                data.push(quartzEntry);
            }

        }

        return data;
    };


    function advanceNumber(str) {

        var quartzCompatibleStr = '';
        var num;
        str.split('').forEach(function (chr) {

            num = parseInt(chr);

            // char is an actual number
            if (!isNaN(num)) {
                // number is in allowed range
                if (num >= 0 && num <= 7) {
                    quartzCompatibleStr += num + 1;
                } else {
                    // otherwise default to 1, beginning of the week
                    quartzCompatibleStr = 1;
                }
            } else {
                quartzCompatibleStr += chr;
            }



        });

        return quartzCompatibleStr;
    }

    /**
     * parse cron 
     * parseCronMagics
     *
     * @param {string} a string representation of a unix CRON entry
     * @return {array} an array representation of a Quartz CRON entry
     *
     */

    function parseCronSyntax(crontabEntry) {

        var quartzEntry = [];

        // first we initialize the seconds to 0 by default because linux CRON entries do not include a seconds definition
        quartzEntry.push('0');

        // quartz scheduler can't handle an OR definition, and so it doesn't support both DOM and DOW fields to be defined
        // for this reason we need to shift one of them to be the value or * and the other to be ?
        var toggleQuartzCompat = false;

        crontabEntry.forEach(function (item, index, array) {


            // index 0 = minutes
            // index 1 = hours
            // these cron definitions should be compatible with quartz so we push them as is
            if (index === 0 || index === 1) {
                quartzEntry.push(item);
            }

            // index 2 = DOM = Day of Month
            if (index === 2) {
                if (item !== '?') {
                    toggleQuartzCompat = true;
                }

                if (item === '*') {
                    toggleQuartzCompat = false;
                    item = '?';
                }

                quartzEntry.push(item);
            }

            // index 3 = Month
            if (index === 3) {
                quartzEntry.push(item);
            }

            // index 4 = DOW = Day of Week
            if (index === 4) {

                // day of week needs another adjustments - it is specified as 1-7 in quartz but 0-6 in crontab
                var itemAbbreviated = advanceNumber(item);

                if (toggleQuartzCompat === true) {
                    quartzEntry.push('?');
                } else {
                    quartzEntry.push(itemAbbreviated);
                }
            }

            // beyond index 4 we don't care and exit the loop
            if (index >= 5) {
                return true;
            }

        });


        // quartz expect a last 7th parameter for scheduling yearly recurrence so we pass * by default for all years
        quartzEntry.push('*');

        return quartzEntry;

    }


    /**
     * parse cron format specified with the shorthand magic @ entries, for example: @hourly
     * parseCronMagics
     *
     * @param {string} a string representation of a unix CRON entry
     * @return {array} an array representation of a Quartz CRON entry
     *
     */

    function parseCronMagics(crontab) {

        var quartzEntry = false;

        // @hourly
        if (crontab.indexOf('@hourly') === 0) {
            quartzEntry = ['0', '0', '*', '*', '*', '?', '*'];
        }

        // @daily and @midnight
        if (crontab.indexOf('@daily') === 0 || crontab.indexOf('@midnight') === 0) {
            quartzEntry = ['0', '0', '0', '*', '*', '?', '*'];
        }

        // @weekly
        if (crontab.indexOf('@weekly') === 0) {
            quartzEntry = ['0', '0', '0', '?', '*', '1', '*'];
        }

        // @monthly
        if (crontab.indexOf('@monthly') === 0) {
            quartzEntry = ['0', '0', '0', '1', '*', '?', '*'];
        }

        // @yearly and @annually
        if (crontab.indexOf('@yearly') === 0 || crontab.indexOf('@annually') === 0) {
            quartzEntry = ['0', '0', '0', '1', '1', '?', '*'];
        }

        return quartzEntry || false;
    }


    var arr = C2Q.getQuartz(cron);

    for (var i = 0, l = arr.length; i < l; i++) {
        arr[i] = arr[i].join(' ');
    }
    return arr;
}
