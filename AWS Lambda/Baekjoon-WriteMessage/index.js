const AWS = require('aws-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
const url = "https://www.acmicpc.net/user/gonudayo";

let resultArr = [];
let problems = 0;


const getData = async () => {
    try {
        return await axios.get(url);
    } catch (error) {}
};

getData().then(html => {

    const $ = cheerio.load(html.data);
    let parentTag = $("tbody tr");

    parentTag.each(function(i, elem) {
        let itemObj = $(this).find("td").text();
        resultArr.push(itemObj);
    });
    problems = resultArr[1];
});

const ddb = new AWS.DynamoDB.DocumentClient({
    region: 'ap-northeast-2'
});

exports.handler = async (event, context, callback) => {
    const requestId = context.awsRequestId;

    await createMessage(requestId).then(() => {
        callback(null, {
            statusCode: 201,
            body: '',
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    }).catch((err) => {
        console.error(err);
    });
};

function createMessage(requestId) {
    let today = new Date();
    let year = today.getFullYear();
    let month = ("0" + (today.getMonth() + 1)).slice(-2);
    let date = ("0" + today.getDate()).slice(-2);

    const params = {

        TableName: 'Message',
        Item: {
            'messageId': requestId,
            'timevalue': Number(year + month + date ),
            'countvalue': problems
        }
    };
    return ddb.put(params).promise();
}