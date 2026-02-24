# Android Permissions for Estato App

## Overview
This document explains all the permissions requested by the Estato real estate application and their purpose.

## Permissions List

### 1. Internet Permissions
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
**Purpose:**
- Download and display property images
- Fetch property listings from server (when backend is integrated)
- Send and receive data from API
- Check network connectivity status

**User Impact:** Required for core app functionality. Without this, the app cannot load property data.

---

### 2. Phone Call Permission
```xml
<uses-permission android:name="android.permission.CALL_PHONE" />
```
**Purpose:**
- Allow users to directly call property owners
- Initiate phone calls from property detail screen

**User Impact:** Users will be asked for permission when they try to call a property owner. Optional - users can still use the app without granting this.

---

### 3. Camera Permission
```xml
<uses-permission android:name="android.permission.CAMERA" />
```
**Purpose:**
- Take photos of properties when listing
- Capture property images directly from camera

**User Impact:** Only requested when sellers want to add property photos. Optional for buyers.

---

### 4. Storage/Gallery Permissions
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```
**Purpose:**
- Select property images from device gallery
- Save downloaded property images
- Cache property images for offline viewing
- Read images for property listings

**User Impact:** 
- READ_EXTERNAL_STORAGE: For Android 12 and below
- READ_MEDIA_IMAGES: For Android 13 and above
- Only requested when users upload property images

---

### 5. Location Permissions
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```
**Purpose:**
- Show properties near user's current location
- Display property locations on map
- Auto-fill location when listing properties
- Filter properties by distance

**User Impact:** Optional permission. Enhances user experience but not required for core functionality.

---

### 6. Storage Management (Android 11+)
```xml
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" android:minSdkVersion="30" />
```
**Purpose:**
- Manage cached property images
- Handle large image files

**User Impact:** Only for Android 11+ devices. Helps with better storage management.

---

## Application Configuration

### Clear Text Traffic
```xml
android:usesCleartextTraffic="true"
```
**Purpose:** Allow HTTP connections (for development/testing with non-HTTPS servers)
**Security Note:** Should be set to `false` in production when using HTTPS API

### Legacy External Storage
```xml
android:requestLegacyExternalStorage="true"
```
**Purpose:** Maintain compatibility with older storage APIs on Android 10
**Note:** Helps with image picker functionality on Android 10 devices

---

## Intent Queries

### Phone/Dialer Intent
```xml
<intent>
    <action android:name="android.intent.action.DIAL" />
</intent>
<intent>
    <action android:name="android.intent.action.CALL" />
</intent>
```
**Purpose:** Check if phone dialer app is available before attempting to make calls

### Browser Intent
```xml
<intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="http" />
</intent>
<intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="https" />
</intent>
```
**Purpose:** Open web links (privacy policy, terms of service, property websites)

### Email Intent
```xml
<intent>
    <action android:name="android.intent.action.SENDTO" />
    <data android:scheme="mailto" />
</intent>
```
**Purpose:** Allow users to email property owners or support

---

## Runtime Permissions (Android 6.0+)

The following permissions require runtime request (user approval during app usage):

1. **CAMERA** - Requested when user taps "Take Photo" for property listing
2. **CALL_PHONE** - Requested when user taps "Call Owner" button
3. **ACCESS_FINE_LOCATION** - Requested when enabling location features
4. **ACCESS_COARSE_LOCATION** - Requested for approximate location
5. **READ_EXTERNAL_STORAGE** / **READ_MEDIA_IMAGES** - Requested when selecting photos

## Install-Time Permissions (No User Prompt)

The following permissions are granted automatically at install:

1. **INTERNET** - Normal permission
2. **ACCESS_NETWORK_STATE** - Normal permission

---

## Privacy Considerations

### Data Collection
- **Location Data:** Only collected when user enables location features. Used solely for showing nearby properties.
- **Photos:** Only accessed when user explicitly selects or takes photos. Not automatically scanned or uploaded.
- **Phone Calls:** Only initiated when user taps call button. No automatic dialing.

### Data Storage
- All sensitive data stored locally using encrypted SharedPreferences
- Images cached locally for performance
- No data shared with third parties without user consent

### Best Practices Implemented
✅ Request permissions only when needed (just-in-time)
✅ Provide clear explanation before requesting permissions
✅ Graceful degradation if permission denied
✅ Respect user's permission choices
✅ Minimal permission requests

---

## Testing Permissions

### Grant Permissions via ADB
```bash
# Grant camera permission
adb shell pm grant com.example.estato_prop android.permission.CAMERA

# Grant location permission
adb shell pm grant com.example.estato_prop android.permission.ACCESS_FINE_LOCATION

# Grant storage permission (Android 12 and below)
adb shell pm grant com.example.estato_prop android.permission.READ_EXTERNAL_STORAGE

# Grant storage permission (Android 13+)
adb shell pm grant com.example.estato_prop android.permission.READ_MEDIA_IMAGES
```

### Revoke Permissions
```bash
adb shell pm revoke com.example.estato_prop android.permission.CAMERA
adb shell pm revoke com.example.estato_prop android.permission.ACCESS_FINE_LOCATION
```

---

## Future Permissions (Not Yet Implemented)

These may be added in future versions:

- **ACCESS_WIFI_STATE** - For better connectivity detection
- **VIBRATE** - For notification alerts
- **RECEIVE_BOOT_COMPLETED** - For scheduled notifications
- **POST_NOTIFICATIONS** (Android 13+) - For push notifications

---

## Compliance

### Google Play Store Requirements
✅ All permissions properly declared in manifest
✅ Privacy policy link included in app
✅ Permissions requested only when necessary
✅ Clear user communication about permission usage

### GDPR Compliance
✅ User consent required for location data
✅ Option to delete user data
✅ Clear privacy policy
✅ Data minimization principle followed

---

## Support

For questions about permissions or privacy, contact the development team.

**Last Updated:** November 4, 2025
**App Version:** 1.0.0

