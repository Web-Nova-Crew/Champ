# Play Store Release Signing Guide

## Step 1: Generate a Keystore (One-time)

Run this command in terminal:
```bash
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

**IMPORTANT:** 
- Save the keystore file securely
- Remember the passwords you set
- Never commit the keystore to git

## Step 2: Create key.properties

Create a file at `android/key.properties` with:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload
storeFile=../upload-keystore.jks
```

**IMPORTANT:** Add `key.properties` to `.gitignore`

## Step 3: Update build.gradle.kts

The build.gradle.kts has been configured for release signing.
Make sure you have the keystore and key.properties files in place.

## Step 4: Build Release APK/AAB

```bash
# Build App Bundle (recommended for Play Store)
flutter build appbundle --release

# Or build APK
flutter build apk --release
```

## Step 5: Upload to Play Store

1. Go to Google Play Console
2. Create new app or select existing
3. Go to Production → Create new release
4. Upload the AAB file from `build/app/outputs/bundle/release/`
5. Fill in release notes
6. Submit for review

## Play Store Listing Requirements

- **App Name:** Estato
- **Short Description:** Find your dream property in Lucknow
- **Full Description:** (Use About Us content)
- **Category:** Lifestyle or House & Home
- **Content Rating:** Everyone
- **Privacy Policy URL:** https://estatoprop.com/privacy
- **Screenshots:** 2-8 phone screenshots required
- **Feature Graphic:** 1024x500 banner image
- **App Icon:** Already configured (512x512)

## Checklist Before Submission

- [x] Privacy Policy in app
- [x] Terms of Service in app
- [x] No debug code
- [x] No print statements in production
- [x] HTTPS only (no cleartext traffic)
- [x] Minimal permissions
- [x] Proper error handling
- [x] Contact information updated
- [ ] Keystore generated
- [ ] key.properties created
- [ ] Release build tested
- [ ] Screenshots prepared
- [ ] Store listing completed
