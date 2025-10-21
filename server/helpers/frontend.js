// const bcrypt = require("bcrypt");

const {
  Op,
  Profile_testimoni,
  Profile_contact,
  Profile_sosial_media,
} = require("../db/models");

const helper = {};

helper.sosial_mediaFN = async () => {
  var list = {};
  await Profile_sosial_media.findAll({}).then(async (value) => {
    var i = 0;
    await Promise.all(
      await value.map(async (a) => {
        list[i] = {
          icon: a.icon,
          name: a.name,
          url: a.url,
        };
        i++;
      })
    );
  });
  return list;
};

helper.get_testimoni_frontendFn = async () => {
  var list = {};
  await Profile_testimoni.findAll({}).then(async (value) => {
    var i = 0;
    await Promise.all(
      await value.map(async (a) => {
        list[i] = {
          testimoni: a.testimoni,
          status: a.status,
          level: a.level,
          img: a.img,
        };
        i++;
      })
    );
  });
  return list;
};

helper.contactFn = async () => {
  var list = {};
  await Profile_contact.findAll({}).then(async (value) => {
    var i = 0;
    await Promise.all(
      await value.map(async (a) => {
        list[i] = {
          name: a.name,
          contact: a.contact,
        };
        i++;
      })
    );
  });
  return list;
};

module.exports = helper;
