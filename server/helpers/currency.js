const currency = require("currency.js");

const helper = {};

helper.hideCurrency = async (price) => {
    if (price.includes(".")) {
        price = price.replace(/\./g, "");
    }
    return Number(price.replace(/[^0-9\.-]+/g, ""));
};

helper.convertToRP = async (price) => {
    return await currency(price, {
        symbol: "Rp ",
        separator: ".",
        precision: 0,
    })
        .format()
        .toString();
};

module.exports = helper;
