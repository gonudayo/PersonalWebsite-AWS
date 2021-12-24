"use strict";
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const stockUrl = "https://www.marketwatch.com/investing/stock/spot/";

const recordSchema = mongoose.Schema({
  day: {
    type: String
  },
  value: {
    type: Number
  }
});

function est() {
  const temp = new Date();
  temp.setHours(temp.getHours() - 5);
  return temp;
}

const today = est();
const year = today.getFullYear();
const month = `0${today.getMonth() + 1}`.slice(-2);
const day = `0${today.getDate()}`.slice(-2);
const dateString = `${year}-${month}-${day}`;

exports.handler = async (event, context, callback) => {
  let Record = mongoose.model('record', recordSchema);
  let connection = null;

  const connect = () => {
    if (connection && mongoose.connection.readyState === 1) return Promise.resolve(connection);
    return mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true
    }).then(
      conn => {
        connection = conn;
        return connection;
      }
    );
  };

  let curStockPrice = 0;
  const getStock = async () => {
    try {
      return await axios.get(stockUrl);
    } catch (error) {}
  };

  await getStock().then(async (html) => {
    const $ = cheerio.load(html.data);
    let parentTag = $('h2 bg-quote.value');

    await parentTag.each(function(i, elem) {
      curStockPrice = $(this).text();
    });

    const record = await new Record({
      day: dateString,
      value: curStockPrice
    });
    await connect().then(() => {
      return record.save();
    }).then(() => {
      return context.done(null, {
        'statusCode': 200,
        'body': JSON.stringify('success')
      });
    }).catch(
      err => callback(err)
    );
  });

};