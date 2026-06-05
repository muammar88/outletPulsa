# TODO: Build Flutter App on Emulator

## Plan Steps:

- [x] Launch emulator (Medium_Phone_API_35)
- [x] flutter pub get
- [x] Step 1: Edit android/gradle/wrapper/gradle-wrapper.properties (update Gradle to 8.7)
- [x] Step 2: Edit android/build.gradle (update AGP to 8.5.2, Kotlin to 1.9.22)
- [x] Step 3: flutter clean
- [ ] Step 4: Clean Gradle caches (rmdir /s C:\Users\ASUS Vivobook\.gradle\caches) - partial, locks prevent full delete
- [x] Step 5: flutter pub get
- [x] Step 6: Relaunch emulator if needed (flutter emulators --launch Medium_Phone_API_35)
- [x] Step 7: flutter run (auto-detects emulator)
