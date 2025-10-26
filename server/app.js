const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const process = require("process");
const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

const port = process.env.PORT;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // untuk Postman, curl, dll.
      return callback(null, origin); // izinkan semua origin
    },
    credentials: true,
  })
);

const arr_router = ["auth"];

// "frontend",
// "login",
// "user",
// {
//   folder: "user",
//   list: [
//     "daftar_member",
//     "daftar_agen",
//     "riwayat_fee_agen",
//     "riwayat_transfer_saldo",
//     "daftar_server",
//     "iak_prabayar",
//     "iak_pascabayar",
//     "tripay_prabayar",
//     "digiflaz_prabayar",
//     "produk_prabayar",
//     "kategori",
//     "operator",
//     "daftar_seller",
//     "daftar_bank",
//     "bank_transfer",
//     "request_deposit",
//     "daftar_deposit",
//     "produk_pascabayar",
//     "daftar_transaksi",
//     "daftar_transaksi_hari_ini",
//     "tes_produk",
//     "riwayat_validasi_seller",
//     "beranda_utama",
//     "otp_pendaftaran",
//     "otp_login",
//   ],
// },
// routers
var arr = {};
arr_router.forEach((e) => {
  if (typeof e === "object" && Object.keys(e.list).length > 0) {
    for (let x in e.list) {
      arr[
        "router_" + e.list[x]
      ] = require(`./router/${e.folder}/${e.list[x]}/index`);
    }
  } else {
    arr["router_" + e] = require(`./router/router_${e}`);
  }
});

// models
const db = require("./models");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

hour = 3600000;

app.use(
  session({
    secret: "OutletTacob4",
    name: "secretName",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: new Date(Date.now() + hour),
      maxAge: hour,
    },
  })
);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use("/static", express.static(__dirname + "/public"));
app.use("/photo", express.static("photo"));

(async () => {
  await db.sequelize.sync();
})();

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use(
  "/jquery-confirm",
  express.static(__dirname + "/node_modules/jquery-confirm/dist")
);

for (let x in arr) {
  app.use(arr[x]);
}

app.listen(port, function () {
  console.log("Server Running On Port " + port);
});
