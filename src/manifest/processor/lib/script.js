import path from 'path'
import { mkdirsSync, writeFileSync} from 'fs-extra'

import * as log from '../../../utils/log'
import * as Remove from '../../../utils/remove';

const makeInjector = function(scriptName) {
  return (
`// Injector file for '${scriptName}'
var context = this;

// http://stackoverflow.com/questions/8403108/calling-eval-in-particular-context/25859853#25859853
function evalInContext(js, context) {
  return function() { return eval(js); }.call(context);
}

function reqListener () {
  evalInContext(this.responseText, context)
}

var request = new XMLHttpRequest();
request.onload = reqListener;
request.open("get", "https://localhost:3001/${scriptName}", true);
request.send();`
  )
}

export default function(scriptName, build) {
  if(process.env.NODE_ENV == 'development') {
    log.pending(`Making injector '${scriptName}'`)

    const injectorScript   = makeInjector(scriptName);
    const injectorFilepath = path.join(build, scriptName);
    const injectorPath     = Remove.file(injectorFilepath)

    mkdirsSync(injectorPath)
    writeFileSync(injectorFilepath, injectorScript, {encoding: 'utf8'})

    log.done()
  }
}
