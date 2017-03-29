
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  
    // grab the body of the request
    var body = request.body.data;
   
    // do a sanity check...
    if (!require(body,['number','url','filename'])){
        response.setStatus(400);
        return required_fields.join(', ') + " are all required fields.";
    }
   
    // is the body.record a sys_id? If not, assume it is a number and try to find it's task record...
    if (!body.record.match(/[a-z0-9]{32}/g)){
        var task = new GlideRecord('task');
        task.addQuery('number',body.record);
        task.query();
        if (!task.next()){
            response.setStatus(404);
            return 'Task not found';
        }
        body.record = task.getValue('sys_id');
    }
    
    // fetch the image and attach it to the task
    var restMessage = new sn_ws.RESTMessageV2();
    restMessage.setHttpMethod("get");
    restMessage.setEndpoint(body.url);
    restMessage.saveResponseBodyAsAttachment('task',body.record,body.filename);
    var res = restMessage.execute();        
  
    // return the status code of the response
    response.setStatus(res.getStatusCode());
  
    // if the status was 200 return the location of the task...
    if (res.getStatusCode() == 200) return "/nav_to.do?uri=task.do?sys_id=" + body.record;
  
    // else return the response that was given to us...
    else return res.getBody();
    
    /**
     * validator function - return true if all fields are on object
     * @param  {Object}  object - The object to validate
     * @param  {Array}   keys   - Array of fields the object must contain
     * @return {Boolean}        - True if object contains all keys
     */
    function require(object,keys){
        return keys.filter(function(a){ return typeof object[a] !== 'undefined'; }) !== keys.length;
    }
})(request, response);

