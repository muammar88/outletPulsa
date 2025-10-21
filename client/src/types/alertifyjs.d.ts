declare module 'alertifyjs' {
  interface AlertifyStatic {
    alert(title: string, message: string): void;
    confirm(
      title: string,
      message: string,
      onok?: () => void,
      oncancel?: () => void
    ): void;
    success(message: string): void;
    error(message: string): void;
    // Tambah sesuai kebutuhan
  }

  const alertify: AlertifyStatic;
  export default alertify;
}
