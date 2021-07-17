const AWS = require('aws-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
const url = "https://www.acmicpc.net/user/gonudayo";
const url2 = "https://github.com/gonudayo?tab=overview&from=";

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

let today = new Date();
let year = today.getFullYear();
let month = ("0" + (today.getMonth() + 1)).slice(-2);
let date = ("0" + today.getDate()).slice(-2);

let resultArr = [];
let problems = 0;
var string;
var no = 0;

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

const getData2 = async () => {
    try {
        return await axios.get(url2 + year + "-01-01");
    } catch (error) {}
};

getData2().then(html => {

    const $ = cheerio.load(html.data);
    let parentTag = $("body div.js-yearly-contributions");

    parentTag.each(function(i, elem) {
        let itemObj = $(this).find("h2").text();
        string = itemObj;
    });
    no = (string.replace(/[^0-9]/g, '')).slice(0, -4);
});

const ddb = new AWS.DynamoDB.DocumentClient({
    region: 'ap-northeast-2'
});

exports.handler = async (event, context, callback) => {
    const requestId = context.awsRequestId;

    await sleep(5000).then(() => createMessage(requestId).then(() => {
        callback(null, {
            statusCode: 201,
            body: '',
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    }).catch((err) => {
        console.error(err);
    }));
};

function createMessage(requestId) {

    const params = {

        TableName: 'Message',
        Item: {
            'messageId': requestId,
            'timevalue': Number(year + month + date),
            'countvalue': problems,
            'commitvalue': no
        }
    };
    return ddb.put(params).promise();
}