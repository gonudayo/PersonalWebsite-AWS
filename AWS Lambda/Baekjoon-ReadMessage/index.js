const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({
    region: "ap-northeast-2"
});
var table_name = "Message"; 
exports.handler = (event, context, callback) => {
    let today = new Date();
    let year = today.getFullYear();
    let month = ("0" + (today.getMonth() + 1)).slice(-2);
    let startdate = ("0" + (today.getDate() - 2)).slice(-2);
    let enddate = ("0" + (today.getDate() + 1)).slice(-2);


    const params = {
        
        TableName: table_name,
        ProjectionExpression: "#timevalue, messageId, countvalue, commitvalue",
        FilterExpression: "#timevalue between :start and :end",
        ExpressionAttributeNames: {
            "#timevalue": "timevalue",
        },
        ExpressionAttributeValues: {
            ":start": Number(year + month + startdate),
            ":end": Number(year + month + enddate)
        }
    };

    ddb.scan(params, onScan);

    function onScan(err, data) {
        if (err) callback(null, err);
        else callback(null, data);
    }

};