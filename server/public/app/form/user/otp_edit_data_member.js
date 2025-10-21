function otp_edit_data_member_index(path, url) {
  var tb = tables({
    width: [30, 25, 15, 25, 5],
    columns: [
      { title: "Info Member", center: true },
      { title: "Nomor Tujuan", center: true },
      { title: "Otp", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools: search_btn({
      placeholder: "Nomor Tujuan",
      width: 250,
      onclick: `onClick="${path}_start('${path}', '${url}')"`,
      path: path,
    }),
    path: path,
    not_found_label: "Daftar Otp Edit Data Member Tidak Ditemukan",
  });

  return tb;
}
