//@auth
//@req(url, name)

import com.hivext.api.core.utils.Transport;

//reading script from URL
var body = new Transport().get(url)

//delete the script if it exists already
jelastic.dev.scripting.DeleteScript(name);

//create a new script 
return jelastic.dev.scripting.CreateScript(name, 'js', body);
