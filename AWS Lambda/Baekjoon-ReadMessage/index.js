const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({
    region: "ap-northeast-2"
});
var table_name = "Message";
exports.handler = (event, context, callback) => {
    let today = new Date();
    let before2= new Date(Date.parse(today) - 2 * 1000 * 60 * 60 * 24);
    let startYear = before2.getFullYear();
    let endYear = today.getFullYear();
    let startMonth = ("0" + (before2.getMonth() + 1)).slice(-2);
    let endMonth = ("0" + (today.getMonth() + 1)).slice(-2);
    let startdate = ("0" + before2.getDate()).slice(-2);
    let enddate = ("0" + today.getDate()).slice(-2);

    const params = {
        
        TableName: table_name,
        ProjectionExpression: "#timevalue, messageId, countvalue, commitvalue",
        FilterExpression: "#timevalue between :start and :end",
        ExpressionAttributeNames: {
            "#timevalue": "timevalue",
        },
        ExpressionAttributeValues: {
            ":start": Number(startYear + startMonth + startdate),
            ":end": Number(endYear + endMonth + enddate)
        }
    };

    ddb.scan(params, onScan);

    function onScan(err, data) {
        if (err) callback(null, err);
        else callback(null, data);
    }

};