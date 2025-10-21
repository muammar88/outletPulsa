const helper = {};

helper.error_msg = async (errors) => {
  console.log("+++++++++++++error_msg");
  console.log("error_msg");
  console.log("+++++++++++++error_msg");

  let num = 0;
  let err_msg = "";
  errors.array().forEach((error) => {
    if (num != 0) err_msg += "<br>";
    err_msg += error.msg;
    num++;
  });
  return err_msg;
};

module.exports = helper;
