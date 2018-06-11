// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const Boom = require("boom")
const sgMail = require('@sendgrid/mail');
process.env.SENDGRID_API_KEY = "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"
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
function lamdaResponse(json){
    if(json && json.isBoom){
        return {statusCode: json.output.statusCode,
            headers:{ "content-type":"application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type',
            'Access-Control-Allow-Methods':	'OPTIONS,GET,POST'},
            body:JSON.stringify(json.output.payload)}
    }else if(typeof json === 'string'){
        var s = json.split(";")
        var b = s[1].split(",")[1]
        var content_type = s[0].split(":")[1]
        if(content_type && "application/json" === ""){
            content_type = "application/json"
        }
        var decoded = new Buffer(b, 'base64')
        return {statusCode: 200,
            headers:{ "content-type":content_type,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type',
            'Access-Control-Allow-Methods':	'OPTIONS,GET,POST'},
            body:decoded}
    }else{
        if(json.forward){
            return json 
        }else{

            return {statusCode: 200,
                headers:{ "content-type":"application/json",
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'content-type',
                'Access-Control-Allow-Methods':	'OPTIONS,GET,POST'},
                body:JSON.stringify(json)}
        }
    }
    
}
exports.handler = function(event, context, callback) {
    if(event.httpMethod === 'OPTIONS') {
        callback(null, lamdaResponse({}));
    }else if(event.httpMethod === 'POST') {
        var body = JSON.parse(event.body)
        var email = body.email
        var name = body.name
        var message = body.message
        
        const msg = {
            to: 'omer@everestlaw.ca',
            from: name + "<" +email+">",
            subject: 'Message from everest.law',
            text: message,
        };
        console.log(msg, event)
        if(email !== "" && name !== "" && message !== ""){
            sgMail.send(msg,(err)=>{
                if(err){
                    callback(null, lamdaResponse(Boom.serverUnavailable(err)))
                }else{
                    callback(null, lamdaResponse({message:"Email sent..."}))

                }
            });
        }else{
            callback(null, lamdaResponse(Boom.forbidden("Email not sent...")))
        }
    }else{
        callback(null, lamdaResponse(Boom.notFound("Email not sent...")))
    }
    
}