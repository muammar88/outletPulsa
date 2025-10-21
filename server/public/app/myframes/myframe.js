/*
    This Application Create and Develop by Muammar Kadafi in malemdiwa team
    Developed at 2024
*/

let base_url = window.location.origin;

let objectLength = (object) => {
  return Object.keys(object).length;
};

let smile_alert = (text) => {
  $.alert({
    icon: "far fa-smile",
    title: "Sukses",
    content: text,
    type: "cyan",
  });
};

let frown_alert = (text) => {
  $.alert({
    icon: "far fa-frown",
    title: "Gagal",
    content: text,
    type: "red",
  });
};

let simpleTableFunc = (obj, width) => {
  var feedBack = "";
  for (let x in obj) {
    feedBack += tr([
      td(
        obj[x].title,
        `class="border py-2 px-3 align-middle" style="width:${width}%;color: #fff;background-color: #5a6268;text-transform:uppercase;"`,
        `class="mb-0"`
      ),
      td(
        obj[x].value,
        `class="border py-2 text-right align-middle" `,
        `style="font-weight:normal;" class="mb-0"`
      ),
    ]);
  }
  return mytable(feedBack);
};

let my_modal = (i) => {
  var params = {};
  if (i.data != undefined) {
    params["data"] = i.data;
  }
  if (i.value != undefined) {
    params["value"] = i.value;
  }
  $.confirm({
    columnClass: "col-" + i.col,
    title: i.title,
    type: "blue",
    theme: "material",
    content: window[i.form_func](params),
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      formSubmit: {
        text: i.btn_label,
        btnClass: i.btn_class != undefined ? i.btn_class : "btn-primary",
        action: function () {
          return i.callback();
        },
      },
    },
  });
};

function selectFN(input) {
  var option = "";
  for (x in input.option) {
    option += `<option value="${input.option[x].id}" >${input.option[x].value}</option>`;
  }
  var html = `<select class="form-control form-control-sm  
  ${input.class != undefined ? input.class : ""}
  " ${input.att != undefined ? input.att : ""} 
  name="${input.name_id}" 
  id="${input.name_id}">
    ${option}
  </select>`;
  return html;
}

function selectFNTag(input) {
  var option = "";
  for (x in input.option) {
    option += `<option value="${input.option[x].id}" >${input.option[x].value}</option>`;
  }
  var html = `<select class="form-control form-control-sm js-example-tags 
  ${input.class != undefined ? input.class : ""}
  " ${input.att != undefined ? input.att : ""} 
  name="${input.name_id}" 
  id="${input.name_id}">
    ${option}
  </select>
  <script>
    $(".js-example-tags").select2({
      tags: true
    });
  </script>`;
  return html;
}

function hide_currency(price) {
  if (price.includes(".")) {
    price = price.replace(/\./g, "");
  }
  return Number(price.replace(/[^0-9\.-]+/g, ""));
}

function numberFormat(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function parsingText(text, long) {
  var splitText = text.split(" ");
  var newText = "";
  for (x = 0; x <= long; x++) {
    if (splitText[x] != undefined) {
      newText = newText + " " + splitText[x];
    }
  }
  return newText + "...";
}

function ajax_file(param, callback, err_callback) {
  let url = param.url == undefined ? "" : param.url;
  let method = param.method == undefined ? "" : param.method;
  let loader = param.loader == undefined ? false : true;
  let headers = {};
  var ret;
  if (localStorage.hasOwnProperty("Bearer")) {
    headers["Authorization"] = "Bearer " + localStorage.getItem("Bearer");
  }
  let data = {};
  if (param.form != undefined && param.form == true) {
    data = new FormData(document.getElementById("form"));
    if (param.ckeditor == true) {
      data.append(
        param.ckeditor_name,
        CKEDITOR.instances[param.ckeditor_name].getData()
      );
    }
  } else {
    if (param.data != undefined) {
      for (x in param.data) data[x] = param.data[x];
    }
  }

  $.ajax({
    url: base_url + "/" + url,
    type: method,
    data: data,
    dataType: "json",
    mimeType: "multipart/form-data",
    headers: headers,
    contentType: false,
    cache: false,
    processData: false,
    async: param.return != undefined && param.return == true ? false : true,
    beforeSend: function () {
      if (loader == true) $("#loaders").show();
    },
    success: function (e, textStatus, xhr) {
      console.log("masuk success");
      if (loader == true) $("#loaders").hide();
      if (e.access_token != undefined)
        localStorage.setItem("Bearer", e.access_token);
      if (param.return != undefined && param.return == true) {
        ret = callback(e, xhr);
      } else {
        callback(e, xhr);
      }
    },
    error: function (xhr, status, error) {
      if (loader == true) $("#loaders").hide();
      var errMsg = eval("(" + xhr.responseText + ")");
      err_callback(xhr.status, errMsg);
    },
    complete: function () {
      if (loader == true) $("#loaders").show();
    },
  });

  if (param.return != undefined && param.return == true) return ret;
}

function ajax_default(param, callback, err_callback) {
  let url = param.url == undefined ? "" : param.url;
  let method = param.method == undefined ? "" : param.method;
  let loader = param.loader == undefined ? false : true;
  let headers = {};
  var ret;
  if (localStorage.hasOwnProperty("Bearer")) {
    headers["Authorization"] = "Bearer " + localStorage.getItem("Bearer");
  }
  let data = {};
  if (param.form != undefined && param.form == true) {
    var formData;
    if (param.form_id != undefined) {
      // formData = new FormData( document.getElementById(param.form_id));
      formData = new FormData($("#" + param.form_id)[0]);
    } else {
      formData = new FormData(document.getElementById("form"));
    }
    for (const [key, value] of formData) {
      data[key] = value;
    }
    if (param.ckeditor == true) {
      data[param.ckeditor_name] =
        CKEDITOR.instances[param.ckeditor_name].getData();
    }
  } else {
    if (param.data != undefined) {
      for (x in param.data) data[x] = param.data[x];
    }
  }
  processData = true;
  if (param.processData != undefined) {
    processData = false;
  }

  var z = {
    url: base_url + "/" + url,
    type: method,
    data: data,
    dataType: "json",
    mimeType: "multipart/form-data",
    headers: headers,
    cache: false,
    processData: processData,
    async: param.return != undefined && param.return == true ? false : true,
    beforeSend: function () {
      if (loader == true) $("#loaders").show();
    },
    success: function (e, textStatus, xhr) {
      console.log("masuk success");
      if (loader == true) $("#loaders").hide();
      if (e.access_token != undefined)
        localStorage.setItem("Bearer", e.access_token);
      if (param.return != undefined && param.return == true) {
        ret = callback(e, xhr);
      } else {
        callback(e, xhr);
      }
    },
    error: function (xhr, status, error) {
      if (loader == true) $("#loaders").hide();
      var errMsg = eval("(" + xhr.responseText + ")");
      err_callback(xhr.status, errMsg);
    },
    complete: function () {
      if (loader == true) $("#loaders").hide();
    },
  };

  $.ajax(z);

  if (param.return != undefined && param.return == true) return ret;
}

function get_data(perpage, JSONData) {
  // create first param
  var paramFirts = {};
  paramFirts["perpage"] = perpage;
  for (x in JSONData["param"]) {
    paramFirts[x] = JSONData["param"][x];
  }
  ajax_default(
    {
      url: JSONData["url"],
      method: "post",
      data: paramFirts,
    },
    function (e) {
      var paginationNumber = e["total"];
      var data = new Array();
      for (var i = 1; i <= paginationNumber; i++) {
        data.push(i);
      }
      var container = $("#" + JSONData["pagination_id"]);
      container.pagination({
        dataSource: data,
        pageSize: perpage,
        showPrevious: true,
        showNext: true,
        callback: function (data, pagination) {
          // create first param
          var paramSecond = {};
          paramSecond["pageNumber"] = pagination["pageNumber"];
          paramSecond["perpage"] = perpage;
          for (y in JSONData["param"]) {
            paramSecond[y] = JSONData["param"][y];
          }
          var html = "";
          if (pagination["pageNumber"] == 1) {
            if (e["data"] != undefined) {
              if (Object.keys(e.data).length > 0) {
                for (x in e["data"]) {
                  html += window[JSONData["fn"]](JSON.stringify(e["data"][x]));
                }
              } else {
                html += `<tr>${JSONData["warning_text"]}</tr>`;
              }
            } else {
              html += `<tr>${JSONData["warning_text"]}</tr>`;
            }
            $("#" + JSONData["bodyTable_id"]).html(html);
            $("#" + JSONData["pagination_id"])
              .children()
              .append(
                `<div class='d-inline-block float-right' style='line-height: 1.6;'>Total : ${e.total} Entries</div>`
              );
          } else {
            ajax_default(
              {
                url: JSONData["url"],
                method: "post",
                data: paramSecond,
              },
              function (e) {
                if (e["data"] != undefined) {
                  if (Object.keys(e.data).length > 0) {
                    for (x in e["data"]) {
                      html += window[JSONData["fn"]](
                        JSON.stringify(e["data"][x])
                      );
                    }
                  } else {
                    html += `<tr>${JSONData["warning_text"]}</tr>`;
                  }
                } else {
                  html += `<tr>${JSONData["warning_text"]}</tr>`;
                }
                $("#" + JSONData["bodyTable_id"]).html(html);
                $("#" + JSONData["pagination_id"])
                  .children()
                  .append(
                    `<div class='d-inline-block float-right' style='line-height: 1.6;'>Total : ${e.total} Entries</div>`
                  );
              }
            );
          }
        },
      });
    }
  );
}

let breadcrumb = (param) => {
  return `<div class="content-header">
            <div class="container-fluid">
              <div class="row mb-2">
                  <div class="col-sm-2 pt-1 px-0">
                    <div class="pt-2 pb-1 px-3 rounded" style="background-color: white;">
                      <h3 class="m-0" style="color: #1e364e;font-weight: bold;font-size: 13px;text-transform: uppercase;" >
                        <i class="${param.icon}"></i> 
                        ${capitalizeFirstLetter(
                          param.menu.replace("_", " ")
                        )}</h3>
                    </div>
                  </div>
                  <div class="col-sm-8"></div>
              </div>
            </div>
          </div>`;
};

function capitalize(text) {
  return text.replace(/\b\w/g, function (m) {
    return m.toUpperCase();
  });
}

let menu = (icon, menu_submenu) => {
  document.getElementById("loaders").style.display = "block";

  param = {};
  param["icon"] = icon;
  param["menu"] = menu_submenu;
  // disabled active
  $(".nav-link").removeClass("active");
  // add class active
  if (menu_submenu != undefined) $("." + menu_submenu).addClass("active");

  var tab = JSON.parse($("#tab").val())[menu_submenu];
  var i = 0;

  var navigation = "";
  var slide = "";

  // checking function funct is exist
  let FnCk = (fn) => {
    if (eval("typeof " + fn) === "function") {
      return true;
    } else {
      return false;
    }
  };

  for (let x in tab) {
    var urls = capitalize(tab[x].path);

    var content = "";
    if (FnCk(tab[x].path + "_index")) {
      content += window[tab[x].path + "_index"](tab[x].path, urls);
    } else {
      content += '<div class="col-12 text-center">Fitur sedang dibangun.</div>';
    }

    navigation += navigationFrame(i, tab[x].path, tab[x].icon, tab[x].name);

    slide += sliderFrame(
      i,
      tab[x].path,
      tab[x].name,
      tab[x].description,
      content
    );

    i++;
  }

  $("#content-area").hide().html(Frame(navigation, slide)).fadeIn(500);
  // param
  $(".content-header").hide().replaceWith(breadcrumb(param)).fadeIn(500);

  for (let x in tab) {
    var urls = capitalize(tab[x].path);
    if (FnCk(tab[x].path + "_start")) {
      window[tab[x].path + "_start"](tab[x].path, urls);
    }
  }

  // $("#loader").hide();
  document.getElementById("loaders").style.display = "none";
};

let navigationFrame = (i, path, icon, name) => {
  return `<li class="nav-item mx-0 ml-lg-0 mr-lg-2 px-1 px-lg-0 " data-target="#sliderContent" data-slide-to="${i}">
            <a class="nav-link nav-insert ${
              i == 0 ? "active" : ""
            }" data-toggle="tab" href="#${i}" style="border-color: #fff0 #fff0 #fff0;">
              <i class="${icon}" style="font-size: 11px;"></i>
              <span class="d-none d-sm-none d-md-none d-lg-inline-block d-md-none">${name}</span>
            </a>
          </li>`;
};

let sliderFrame = (i, path, name, description, content) => {
  return `<div class="carousel-item ${i == 0 ? "active" : ""}">
            <div class="row">
                <div class="col-12 col-sm-10 col-md-8 col-lg-8 p-3">
                  <p class="m-0 description" >${description}</p>
                </div>
                <div class="d-none d-sm-block col-sm-2 col-md-4 col-lg-4 p-3 text-right">
                  <span class="showPosition" id="showPos${path}">${name}</span>
                </div>
                <div class="col-12 col-lg-12 px-3 pb-0 pt-0">
                  <div class="row" id="content_${path}">${content}</div>
                </div>
            </div>
		      </div>`;
};

let Frame = (navigation, slide) => {
  return `<div class="col-md-12 col-lg-12 col-xl-12 px-0">
            <ul class="nav nav-tabs">
              ${navigation}
            </ul>
          </div>
          <div class="col-md-12 col-lg-12 col-xl-12 h-100 mb-3 innerContent" >
            <div class="row">
              <div class="col-12">
                <div id="sliderContent" class="carousel slide" data-ride="carousel" data-interval="false" style="min-height: 73vh;height: 100%;font-size: 12px;">
                  <div class="carousel-inner">
                    ${slide}
                  </div>
                </div>
              </div>
            </div>
          </div>`;
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function h3(text, classes) {
  return `<h3 class="card-title ${
    classes == undefined ? "mt-0" : classes
  }" style="font-size: .975rem;">
			<b>${text}</b>
		</h3>`;
}

function formHidden(param) {
  return `<input type="hidden" name="${param.id_name}" value="${param.value}">`;
}

function formInputText(param) {
  return `<div class="form-group">
               <label>${param.title}</label>
               <input type="text" class="form-control form-control-sm" id="${
                 param.id_name
               }" name="${param.id_name}" value="${param.value}" placeholder="${
    param.placeholder
  }" ${param.disabled != undefined ? 'disabled=""' : ""}>
          </div>`;
}

function formInputDate(param) {
  return `<div class="form-group">
               <label>${param.title}</label>
               <input type="date" class="form-control form-control-sm" id="${
                 param.id_name
               }" name="${param.id_name}" value="${param.value}" placeholder="${
    param.placeholder
  }" ${param.disabled != undefined ? 'disabled=""' : ""}>
          </div>`;
}

function formTextArea(param) {
  return `<div class="form-group">
               <label>${param.title}</label>
               <textarea class="form-control form-control-sm" id="${
                 param.id_name
               }" name="${param.id_name}" rows="${
    param.row
  }" style="resize:none;" placeholder="${param.placeholder}" ${
    param.disabled != undefined ? 'disabled=""' : ""
  }>${param.value}</textarea>
       
  </div>`;
}

function formCheck(param) {
  var list = "";
  for (r in param.data) {
    check = "";
    if (Object.keys(param.value).length > 0) {
      if (param.value.includes(param.data[r].id.toString())) {
        check = "checked";
      }
    }
    list += `<div class="col-6" >
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${param.data[r].id}" id="${param.data[r].path}" name="${param.name}[${param.data[r].id}]" ${check} >
                <label class="form-check-label" for="${param.data[r].path}">${param.data[r].name}</label>
              </div>
            </div>`;
  }
  return `<div class="form-group">
            <label>${param.title}</label>
            <div class="row">
              ${list}
            </div>
          </div>`;
}

function formSelect(param) {
  var option = "";
  for (x in param.data) {
    var selected = "";
    if (param.select != undefined)
      selected = param.data[x].id == param.select ? "selected" : "";
    option += `<option value="${param.data[x].id}" ${selected}>${param.data[x].name}</option>`;
  }
  return `<div class="form-group">
            <label>${param.title}</label>
            <select class="form-control form-control-sm" name="${param.id_name}">
              ${option}
            </select>
          </div>  `;
}

function previewImagePaket(imgSrc) {
  $.confirm({
    columnClass: "col-3",
    title: "Preview Image",
    theme: "material",
    content: `<div class="content">
                 <div class="row mx-0">
                    <div class="col-lg-12">
                       <img src="${base_url}/photo/paket/${imgSrc}" class="img-fluid" alt="Responsive image" style="width: 100%;">
                    </div>
                 </div>
              </div>`,
    closeIcon: false,
    buttons: {
      ok: {
        text: "Tutup",
        btnClass: "btn-blue",
        action: function () {
          return true;
        },
      },
    },
  });
}

function formFile(param) {
  var show = "";
  if (param.value != "") {
    show = `<a class="ml-3" style="color: #a7a7a7 !important;font-style: italic;float: right;" onclick="previewImagePaket('${param.value}')">
              <i class="fas fa-search"></i> Preview Photo
            </a>`;
  }

  return `<div class="form-group">
            <label>${param.title}  
              ${param.required == true ? '<span class="red">*</span>' : ""}
            </label>
            ${show}
            <input 
              type="file" 
              name="${param.id_name}" 
              placeholder="${param.placeholder}" 
              class="photo_pengguna form-control form-control-sm">
            ${
              param.note_status == true
                ? `<small class="form-text text-muted"><i>${param.note}</i></small>`
                : ""
            } 
          </div>`;
}

function btn_primary(param) {
  return `<button class="btn btn-secondary  ${
    param.class == undefined ? "" : param.class
  }" type="button" onclick="${param.onclick}()" title="${param.title}" ${
    param.att == undefined ? "" : param.att
  }>
            <i class="${param.icon}"></i> ${param.label}
          </button>`;
}

function btn_success(param) {
  return `<button class="btn btn-success  ${
    param.class == undefined ? "" : param.class
  }" type="button" onclick="${param.onclick}()" title="${param.title}" ${
    param.att == undefined ? "" : param.att
  }>
            <i class="${param.icon}"></i> ${param.label}
          </button>`;
}

function div_row(input, att) {
  return `<div class="row ${att == undefined ? "" : att}">${input}</div>`;
}
function div_col_1(input, att) {
  return `<div class="col-1 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_2(input, att) {
  return `<div class="col-2 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_3(input, att) {
  return `<div class="col-3 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_4(input, att) {
  return `<div class="col-4 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_5(input, att) {
  return `<div class="col-5 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_6(input, att) {
  return `<div class="col-6 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_7(input, att) {
  return `<div class="col-7 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_8(input, att) {
  return `<div class="col-8 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_9(input, att) {
  return `<div class="col-9 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_10(input, att) {
  return `<div class="col-10 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_11(input, att) {
  return `<div class="col-11 ${att == undefined ? "" : att}">${input}</div>`;
}

function div_col_12(input, att) {
  return `<div class="col-12 ${att == undefined ? "" : att}">${input}</div>`;
}

function col_12(i) {
  return div_col_12(i);
}

let option_gen = (param) => {
  var option = `<option value="0">${param.default}</option>`;
  for (let x in param.data) {
    option += `<option value="${param.data[x].id}" ${
      param.selected != undefined
        ? param.data[x].id == param.selected
          ? "selected"
          : ""
        : ""
    }>${param.data[x].name}</option>`;
  }
  return option;
};

function select(i) {
  return `<div class="form-group">
              <label>${i.label}</label>
              <select class="form-control js-example-tags" name="${i.id_name}" id="${i.id_name}" placeholder="${i.placeholder}" $>
                ${i.option}
              </select>
          </div>`;
}

function textarea(i) {
  return `<div class="form-group">
            <label>${i.label}</label>
            <textarea class="form-control" name="${i.id_name}" id="${i.id_name}" placeholder="${i.placeholder}" style="resize: none;" rows="5">${i.value}</textarea>
          </div>`;
}

function input_text(i) {
  return `<div class="form-group">
              <label>${i.label}</label>
              <input type="text" name="${i.id_name}" id="${i.id_name}" class="form-control" value="${i.value}" placeholder="${i.placeholder}">
          </div>`;
}

function input_curency(i) {
  return `<div class="form-group">
              <label>${i.label}</label>
              <input type="text" name="${i.id_name}" id="${i.id_name}" class="form-control currency" value="${i.value}" placeholder="${i.placeholder}">
          </div>`;
}

function input_file(i) {
  return `<div class="form-group">
              <label>${i.label}</label>
              <input type="file" name="${
                i.id_name
              }" class="form-control" placeholder="${i.placeholder}">
              ${
                i.note != undefined
                  ? `<small id="${i.id_name}Help" class="form-text text-muted">${i.note}</small>`
                  : ""
              }
          </div>`;
}

function myForm(i) {
  var f = "";
  for (let x in i) {
    f += i[x];
  }
  return `<form id="form" class="formName" enctype="multipart/form-data" method="post">
              <div class="row px-0 py-3 mx-0">
                  ${f} 
              </div>
          </form>`;
}

function tr(input, att) {
  var html = "";
  for (x in input) {
    html += input[x];
  }
  var stl = "";
  if (att != undefined) {
    stl += att;
  }
  return `<tr ${stl}>${html}</tr>`;
}

function mytable(input, att) {
  return `<table class="table  ${
    att == undefined ? "mb-0" : att
  }">${input}</table>`;
}

function tbody(input) {
  return `<tbody>${input}</tbody>`;
}

function thead(input) {
  return `<thead>${input}</thead>`;
}

function option(param) {
  return `<option value="${param.value}" ${
    param.selected == undefined ? "" : param.selected
  } >${param.name}</option>`;
}

function td_center(input, att) {
  var html = "";
  for (let x in input) {
    html += input[x];
  }
  var stl = "";
  if (att != undefined) {
    stl += att;
  }
  return `<td ${stl}><center>${html}</center></td>`;
}

// function td_right(input, att) {
//   var html = "";
//   for (x in input) {
//     html += input[x];
//   }
//   var stl = "";
//   if (att != undefined) {
//     stl += att;
//   }
//   return `<td ${stl}>${html}</td>`;
// }

function th_center(input, att) {
  var html = "";
  for (x in input) {
    html += input[x];
  }
  var stl = "";
  if (att != undefined) {
    stl += att;
  }
  return `<th ${stl}><center>${html}</center></th>`;
}

function td(input, att, label_att) {
  var stl = "";
  if (att != undefined) {
    stl += att;
  }
  var list_input = "";
  for (let x in input) {
    list_input += input[x];
  }
  return `<td ${stl}>
            <label ${label_att != undefined ? label_att : ""}>
              ${list_input}
            </label>
          </td>`;
}

function search_btn(param) {
  return `<div class="card-tools mt-2 mr-0">
            <div class="input-group input-group-sm " style="width: ${
              param.width
            }px;">
            ${param.att != undefined ? param.att : ""}
              <input type="text" id="search_${
                param.path
              }" class="form-control float-right" style="width: 200px;" 
                placeholder="Search by ${param.placeholder}">
              <div class="input-group-append" >
                <button type="button" class="btn btn-default" ${param.onclick}>
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>`;
}

function centers(html) {
  return `<center>${html}</center>`;
}

function tables(param) {
  var header = "";
  var row = 0;
  if (param.row_col_span != undefined && param.row_col_span == true) {
    for (a in param.columns) {
      header += "<tr>";
      var n = 0;
      for (b in param.columns[a]) {
        var center =
          param.columns[a][b].center == undefined
            ? true
            : param.columns[a][b].center;
        header += `<th style="width:${a == 0 ? param.width[n] + "%;" : ""}${
          param.border != undefined || param.border == true
            ? "border : 2px solid #dee2e6;"
            : ""
        }" ${
          param.columns[a][b].attribute != undefined
            ? param.columns[a][b].attribute
            : ""
        }>${
          center == true
            ? centers(param.columns[a][b].title)
            : param.columns[a][b].title
        }</th>`;
        n++;
      }
      header += "</tr>";
    }
    if (param.row == undefined) {
      row = n;
    } else {
      row = param.row;
    }
  } else {
    header += "<tr>";
    var n = 0;
    for (y in param.columns) {
      var center =
        param.columns[y].center == undefined ? true : param.columns[y].center;
      header += `<th style="width:${param.width[y]}%;${
        param.border != undefined || param.border == true
          ? "border : 1px solid black;"
          : ""
      }" ${param.attribute != undefined ? param.attribute : ""}>${
        center == true
          ? centers(param.columns[y].title)
          : param.columns[y].title
      }</th>`;
      n++;
    }
    header += "</tr>";
    row = n;
  }

  var html = `<div class="col-lg-12 col-12">
                <div class="row">
                  <div class="col-lg-12">
                    <div class="card  ">
                      <div class="card-header border-transparent py-2 px-3" id="card-header-${param.path}" style="background-color: #dddddd;min-height: 50px;">
                        ${param.tools}
                      </div>
                      <div class="card-body p-0" id="card-body-${param.path}">
                        <div class="table-responsive">
                          <table class="table m-0">
                            <thead>
                              ${header}
                            </thead>
                            <tbody id="body_${param.path}">
                              <tr>
                                <td colspan="${row}" >
                                  <center>
                                    ${param.not_found_label}
                                  </center>
                                </td>
                              </tr>     
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div class="card-footer clearfix py-3" id="pagination_${param.path}">
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;
  return html;
}

let btnPrimary = (param) => {
  return `<button type="button" class="btn btn-primary btn-action px-0 ml-1 my-1 
            ${param.att != undefined ? param.att : ""}" title="${param.title}" 
            ${param.onClick} >
            <i class="${param.icon} mx-auto" style="font-size: 11px;"></i>
          </button>`;
};

let btnSuccess = (param) => {
  return `<button type="button" class="btn btn-success btn-action px-0 ml-1 my-1 
            ${param.att != undefined ? param.att : ""}" title="${param.title}" 
            ${param.onClick} >
            <i class="${param.icon} mx-auto" style="font-size: 11px;"></i>
          </button>`;
};

let btnDefault = (param) => {
  return `<button type="button" class="btn btn-default btn-action px-0 ml-1 my-1 
            ${param.att != undefined ? param.att : ""}" title="${param.title}" 
            ${param.onClick} >
            <i class="${param.icon} mx-auto" style="font-size: 11px;"></i>
          </button>`;
};

let btnDanger = (param) => {
  return `<button type="button" class="btn btn-danger btn-action px-0 ml-1 my-1 
            ${param.att != undefined ? param.att : ""}" title="${param.title}" 
            ${param.onClick} >
            <i class="${param.icon} mx-auto" style="font-size: 11px;"></i>
          </button>`;
};

class my_validation {
  input;
  error;
  error_list = [];

  body(i) {
    this.input = $("#" + i).val();
    this.error = false;
    return this;
  }

  hide_currency(price) {
    if (price.includes(".")) {
      price = price.replace(/\./g, "");
    }
    return Number(price.replace(/[^0-9\.-]+/g, ""));
  }

  nol_currency() {
    if (this.hide_currency(this.input) == 0) this.error = true;
    return this;
  }

  empty_currency() {
    if (this.hide_currency(this.input) == "") this.error = true;
    return this;
  }

  empty() {
    if (this.input == "") this.error = true;
    return this;
  }

  select_not_nol() {
    if (this.input == "0") this.error = true;
    return this;
  }

  withMessage(m) {
    if (this.error == true) this.error_list.push(m);
    return this;
  }

  message() {
    var feedBack = `<ul class="pl-3">`;
    for (let x in this.error_list) {
      feedBack += `<li>${this.error_list[x]}</li>`;
    }
    feedBack += `</ul>`;
    return feedBack;
  }

  respose() {
    if (this.error_list.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
