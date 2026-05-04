# Requirements Document

## Introduction

This document defines the requirements for the **Advanced Safety Features** expansion of the Panic Ring personal safety application. The existing app provides SOS panic button (urgent/discreet/check-in modes), GPS tracking, emergency contacts with WhatsApp alerts, live map with safe zones, Find My Device, smartwatch integration with fall detection, low battery alerts, offline mode with queued alerts, JWT authentication, and an admin dashboard.

The new capabilities span four domains:

1. **Enhanced Detection & Triggering** — additional SOS activation methods (voice commands, shake detection, hidden button) and improved GPS accuracy with cell-tower/last-known fallback.
2. **Evidence & Streaming** — automatic audio/video recording on alert trigger with cloud upload, and live location streaming for trusted contacts.
3. **Intelligence & Automation** — AI-powered risk detection, advanced geofencing with unsafe-zone support, escalation chains, and direct emergency-services integration.
4. **UX & Accessibility** — dark mode, multilingual support (English, Zulu, Afrikaans, Xhosa), end-to-end encryption for location data, journey planner with "Follow Me" mode, enhanced fake call, community safety map, home-screen widgets, and a loud alarm siren with flashing screen.

The app is built with React + Vite (frontend) and Node.js + Express + SQLite (backend).

---

## Glossary

- **App**: The Panic Ring React + Vite progressive web application.
- **Backend**: The Node.js + Express + SQLite server.
- **Alert**: A panic event record stored in the `alerts` table with a status of `active` or `resolved`.
- **Contact**: An emergency contact record in the `emergency_contacts` table belonging to a specific user.
- **Contact_Hierarchy**: An ordered escalation chain of Contacts, where each Contact has a numeric priority and a response timeout.
- **Device**: A record in the `shared_devices` table representing a user's phone or smartwatch.
- **Distress_Detector**: The existing `useDistressDetector` hook that monitors microphone volume and speech keywords.
- **Evidence_Package**: A bundle of audio and/or video recordings captured at alert trigger time, stored in cloud storage and linked to an Alert.
- **Geofence**: A named circular boundary defined by a centre coordinate and radius, stored in the `safe_zones` table.
- **Journey**: A planned route with a start point, end point, estimated duration, and a set of Contacts designated as followers.
- **Location_Stream**: A real-time sequence of GPS coordinates pushed from the App to the Backend and made available to authorised Contacts.
- **Risk_Engine**: The backend service that analyses movement patterns to detect anomalies and generate proactive warnings.
- **Safe_Zone**: A Geofence classified as safe (type = `safe`).
- **Unsafe_Zone**: A Geofence classified as unsafe (type = `unsafe`).
- **SMS_Gateway**: The backend service that sends SMS messages via a configured provider when internet data is unavailable.
- **Siren**: The in-app audio alarm and screen-flash component activated to draw physical attention.
- **Wearable**: A Bluetooth-connected smartwatch or ring device capable of sending SOS triggers to the App.
- **Widget**: A home-screen shortcut element (PWA shortcut or native widget) that provides one-tap access to SOS or status.
- **E2EE**: End-to-end encryption applied to location payloads before transmission.
- **Community_Map**: A shared, anonymised map layer showing user-reported safety incidents in a geographic area.
- **Fake_Call**: A simulated incoming phone call UI used to provide a plausible excuse to leave a dangerous situation.
- **i18n**: Internationalisation — the mechanism for rendering the App UI in multiple languages.
- **Locale**: A language/region combination (e.g., `en-ZA`, `zu-ZA`, `af-ZA`, `xh-ZA`).

---

## Requirements

### Requirement 1: Enhanced GPS Accuracy with Fallback

**User Story:** As a user in a low-signal area, I want the App to maintain the best possible location fix so that my emergency contacts always receive a usable location.

#### Acceptance Criteria

1. WHEN the App requests a location fix, THE App SHALL attempt GPS acquisition with `enableHighAccuracy: true` and a 10-second timeout.
2. IF GPS acquisition fails or returns accuracy worse than 150 metres, THEN THE App SHALL fall back to network/cell-tower positioning with `enableHighAccuracy: false`.
3. IF both GPS and network positioning fail, THEN THE App SHALL use the most recent cached location stored within the last 30 minutes.
4. WHEN a location fix is obtained, THE App SHALL record the fix source (`gps`, `network`, or `cached`) alongside the coordinates.
5. WHEN transmitting an Alert, THE Backend SHALL include the fix source and accuracy value in the alert record.
6. WHILE a location fix is unavailable and no cached location exists within 30 minutes, THE App SHALL display a visible indicator informing the user that location is unavailable.

---

### Requirement 2: Multi-Method SOS Triggering

**User Story:** As a user in a dangerous situation, I want multiple ways to trigger an SOS so that I can activate help even when I cannot interact with the screen normally.

#### Acceptance Criteria

1. WHEN the user speaks the phrase "help", "SOS", or "emergency" while the Distress_Detector is active, THE App SHALL trigger an Alert within 2 seconds of keyword detection.
2. WHEN the device accelerometer detects a shake pattern of 3 or more threshold-crossing events within 1.5 seconds, THE App SHALL trigger an Alert.
3. WHERE the user has enabled the hidden button in Settings, THE App SHALL render a transparent, tap-target overlay of at least 44×44 CSS pixels in a configurable screen corner.
4. WHEN the hidden button overlay is tapped 3 times within 2 seconds, THE App SHALL trigger an Alert.
5. THE App SHALL apply a 15-second cooldown between consecutive shake-triggered Alerts to prevent duplicate triggers.
6. WHEN any non-button trigger method activates an Alert, THE App SHALL record the trigger method as `voice_command`, `shake_detection`, or `hidden_button` in the alert record.
7. WHERE the user has disabled a specific trigger method in Settings, THE App SHALL not activate that trigger method.

---

### Requirement 3: Automatic Audio/Video Recording and Cloud Upload

**User Story:** As a user triggering an SOS, I want the App to automatically capture audio and video evidence so that it can be used to support my emergency response.

#### Acceptance Criteria

1. WHEN an Alert is triggered, THE App SHALL request microphone and camera permissions if not already granted.
2. WHEN microphone permission is granted at alert trigger time, THE App SHALL begin audio recording within 1 second of the Alert being created.
3. WHEN camera permission is granted at alert trigger time and the alert mode is not `discreet`, THE App SHALL begin video recording within 1 second of the Alert being created.
4. WHEN an Alert is resolved or after a maximum recording duration of 5 minutes, THE App SHALL stop all active recordings.
5. WHEN a recording is complete, THE App SHALL upload the recording to the configured cloud storage endpoint and obtain a URL.
6. WHEN the upload succeeds, THE Backend SHALL update the Alert record with the `audio_url` and/or `video_url` fields.
7. IF the upload fails due to network unavailability, THEN THE App SHALL store the recording locally and retry the upload when connectivity is restored.
8. WHEN an Evidence_Package URL is available, THE App SHALL include the URL in all WhatsApp alert messages sent to Contacts.
9. THE App SHALL display a visible recording indicator to the user while recording is active.

---

### Requirement 4: Live Location Streaming for Trusted Contacts

**User Story:** As a trusted contact, I want to monitor a user's real-time movements so that I can track their safety continuously without waiting for an SOS.

#### Acceptance Criteria

1. WHEN a user enables Live Streaming for a Contact, THE App SHALL begin transmitting GPS coordinates to the Backend at intervals of no more than 10 seconds.
2. THE Backend SHALL expose a polling endpoint that returns the latest streamed coordinates for a given user, accessible only to authenticated Contacts who have been granted streaming permission.
3. WHEN a Contact accesses the live stream view, THE App SHALL display the user's current position on a map, updating at intervals of no more than 10 seconds.
4. WHEN the user disables Live Streaming, THE Backend SHALL stop accepting new coordinate updates for that session and mark the stream as inactive.
5. WHILE Live Streaming is active, THE App SHALL display a persistent indicator showing that location is being shared.
6. IF the App loses GPS signal for more than 30 seconds during an active stream, THEN THE App SHALL transmit the last known coordinates with a `stale: true` flag.
7. THE Backend SHALL retain streamed location history for a maximum of 24 hours before automatic deletion.

---

### Requirement 5: Advanced Geofencing with Unsafe Zones

**User Story:** As a user, I want to define both safe and unsafe geographic zones so that I and my contacts are automatically alerted when I enter or leave areas of concern.

#### Acceptance Criteria

1. THE App SHALL allow the user to create a Geofence with a name, centre coordinate, radius (50–5000 metres), and a type of either `safe` or `unsafe`.
2. WHEN the user's location enters a Safe_Zone, THE Backend SHALL send a notification to the user's Contacts indicating arrival in a safe area.
3. WHEN the user's location exits a Safe_Zone, THE Backend SHALL create an active Alert and notify Contacts.
4. WHEN the user's location enters an Unsafe_Zone, THE Backend SHALL create an active Alert and notify Contacts within 30 seconds of detection.
5. WHEN the user's location exits an Unsafe_Zone, THE Backend SHALL send a notification to Contacts indicating the user has left the unsafe area.
6. THE App SHALL display Safe_Zones and Unsafe_Zones on the live map with visually distinct colours (green for safe, red for unsafe).
7. THE Backend SHALL evaluate geofence status at each location update and SHALL NOT send duplicate alerts for the same zone transition within a 5-minute window.
8. WHERE the user has disabled geofence alerts in Settings, THE Backend SHALL not generate geofence-triggered Alerts.

---

### Requirement 6: AI-Powered Risk Detection

**User Story:** As a user, I want the app to proactively detect unusual movement patterns so that it can warn me or my contacts before a situation escalates.

#### Acceptance Criteria

1. WHILE location tracking is active, THE Risk_Engine SHALL analyse the user's movement data at intervals of no more than 60 seconds.
2. WHEN the user remains stationary at an unexpected location for more than 10 minutes without a check-in, THE Risk_Engine SHALL generate a risk warning.
3. WHEN the user's movement speed drops from above 5 km/h to 0 km/h suddenly and remains at 0 km/h for more than 3 minutes, THE Risk_Engine SHALL generate a risk warning.
4. WHEN the user deviates more than 500 metres from a planned Journey route, THE Risk_Engine SHALL generate a route-deviation warning.
5. WHEN the Risk_Engine generates a warning, THE App SHALL display a push notification asking the user to confirm they are safe within 60 seconds.
6. IF the user does not respond to the safety confirmation within 60 seconds, THEN THE Backend SHALL notify the user's Contacts with the warning details and last known location.
7. THE Risk_Engine SHALL maintain a rolling window of the last 20 location samples to compute movement metrics.
8. WHERE the user has disabled AI risk detection in Settings, THE Risk_Engine SHALL not generate warnings for that user.

---

### Requirement 7: Loud Alarm Siren and Flashing Screen

**User Story:** As a user in a dangerous situation, I want the app to produce a loud alarm and flash the screen so that I can draw attention from people nearby.

#### Acceptance Criteria

1. WHEN the user activates the Siren, THE App SHALL play a repeating audio alarm at the maximum available device volume using the Web Audio API.
2. WHEN the Siren is active, THE App SHALL flash the screen between full white and the current background colour at a rate of 2 flashes per second.
3. THE App SHALL provide a clearly visible stop button that deactivates the Siren within 500 milliseconds of being tapped.
4. WHEN the Siren is activated, THE App SHALL request a wake lock to prevent the screen from turning off.
5. IF the Web Audio API is unavailable, THEN THE App SHALL display a full-screen high-contrast alert message as a fallback.
6. THE Siren SHALL be accessible from the home screen quick actions without requiring navigation to another page.
7. WHEN the Siren is active for more than 60 seconds without user interaction, THE App SHALL display a confirmation prompt asking whether to continue.

---

### Requirement 8: Wearable Device Integration

**User Story:** As a user wearing a smartwatch or Bluetooth ring, I want to trigger an SOS from my wearable so that I can activate help without reaching for my phone.

#### Acceptance Criteria

1. THE App SHALL support SOS trigger via Web Bluetooth API from paired Bluetooth Low Energy devices that send a designated SOS characteristic.
2. WHEN a paired Wearable sends an SOS signal, THE App SHALL trigger an Alert within 3 seconds of receiving the signal.
3. THE App SHALL display the connection status of paired Wearables on the Watch dashboard page.
4. WHEN a Wearable disconnects unexpectedly, THE App SHALL display a notification informing the user that the wearable connection was lost.
5. THE App SHALL allow the user to pair, rename, and remove Wearable devices from the Settings page.
6. WHERE the Wearable supports heart rate data, THE App SHALL include the heart rate value in the Alert record when an SOS is triggered from that device.
7. THE Backend SHALL store Wearable device records in the `shared_devices` table with `device_type = 'wearable'`.

---

### Requirement 9: Offline SMS-Based Alerts

**User Story:** As a user in an area with no internet connectivity, I want the app to send SMS alerts so that my contacts are notified even when data is unavailable.

#### Acceptance Criteria

1. WHEN an Alert is triggered and the device has no internet connectivity, THE App SHALL attempt to send SMS messages to all Contacts with a registered phone number.
2. THE Backend SHALL expose an SMS dispatch endpoint that accepts an alert payload and routes it through the configured SMS_Gateway provider.
3. WHEN internet connectivity is restored after an offline Alert, THE App SHALL sync the queued Alert to the Backend and mark it as sent via SMS.
4. THE App SHALL display a visible indicator when an Alert has been sent via SMS fallback.
5. IF the SMS_Gateway returns a delivery failure for a Contact, THEN THE Backend SHALL log the failure and mark that Contact's notification as `failed` in the alert record.
6. THE Backend SHALL support configuration of the SMS_Gateway provider credentials via environment variables without requiring code changes.
7. WHERE the user has not configured SMS fallback in Settings, THE App SHALL not attempt SMS dispatch and SHALL rely on the existing WhatsApp offline fallback.

---

### Requirement 10: Direct Emergency Services Integration

**User Story:** As a user in a life-threatening emergency, I want the app to contact emergency services directly so that professional help is dispatched as quickly as possible.

#### Acceptance Criteria

1. WHEN the user activates the `urgent` SOS mode, THE App SHALL display a one-tap button to initiate a direct call to the local emergency number (configurable, default `10111` for South Africa).
2. WHERE the user has enabled `auto_call_911` in their safety profile, THE App SHALL automatically initiate the emergency call within 5 seconds of an urgent Alert being created.
3. THE App SHALL allow the user to configure the emergency services number in Settings to support different regional numbers.
4. WHEN an emergency call is initiated, THE App SHALL log the call attempt in the Alert record with a timestamp.
5. IF the emergency call cannot be initiated (e.g., no cellular signal), THEN THE App SHALL display a clear error message and suggest alternative actions.

---

### Requirement 11: Customisable Contact Hierarchy and Escalation

**User Story:** As a user, I want to define an escalation chain for my contacts so that if the first contact does not respond, the next one is automatically notified.

#### Acceptance Criteria

1. THE App SHALL allow the user to assign a numeric priority (1–10) and a response timeout (1–30 minutes) to each Contact.
2. WHEN an Alert is created, THE Backend SHALL notify the Contact with the lowest priority number first.
3. WHEN a Contact does not acknowledge an Alert within their configured response timeout, THE Backend SHALL notify the next Contact in the Contact_Hierarchy.
4. WHEN all Contacts in the hierarchy have been notified without acknowledgement, THE Backend SHALL escalate the Alert to the emergency services number configured in the user's safety profile.
5. THE App SHALL display the current escalation status on the active Alert banner, showing which Contact was last notified and how long ago.
6. WHEN a Contact acknowledges an Alert by responding via a provided link, THE Backend SHALL stop further escalation and update the Alert status to `acknowledged`.
7. THE Backend SHALL record each escalation step with a timestamp in the Alert record.

---

### Requirement 12: Dark Mode and Multilingual Support

**User Story:** As a user, I want to choose my preferred display theme and language so that the app is comfortable and accessible in my native language.

#### Acceptance Criteria

1. THE App SHALL provide a dark mode and a light mode, selectable from the Settings page.
2. WHEN the user selects a theme, THE App SHALL apply the theme immediately without requiring a page reload.
3. THE App SHALL persist the selected theme in local storage and apply it on subsequent app launches.
4. THE App SHALL support the following Locales: `en-ZA` (English), `zu-ZA` (Zulu), `af-ZA` (Afrikaans), and `xh-ZA` (Xhosa).
5. WHEN the user selects a Locale, THE App SHALL render all UI labels, button text, error messages, and alert messages in the selected language.
6. THE App SHALL persist the selected Locale in local storage and apply it on subsequent app launches.
7. IF a translation string is missing for the selected Locale, THEN THE App SHALL fall back to the `en-ZA` string.
8. THE App SHALL provide a language selector accessible from the Settings page.

---

### Requirement 13: End-to-End Encryption for Location Data

**User Story:** As a user, I want my location data to be encrypted end-to-end so that only my authorised contacts can read it.

#### Acceptance Criteria

1. WHEN the user enables E2EE in Settings, THE App SHALL generate a unique asymmetric key pair for the user and store the private key in the device's secure storage (IndexedDB with encryption).
2. WHEN transmitting location data to the Backend during Live Streaming, THE App SHALL encrypt the payload using the public keys of all authorised Contacts before transmission.
3. THE Backend SHALL store encrypted location payloads without decrypting them.
4. WHEN an authorised Contact retrieves a location payload, THE App SHALL decrypt it client-side using the Contact's private key.
5. IF E2EE is disabled, THE App SHALL transmit location data using the existing HTTPS transport without additional encryption.
6. THE App SHALL display a visible E2EE indicator when location sharing is active and E2EE is enabled.
7. WHEN the user revokes a Contact's access, THE App SHALL re-encrypt future location payloads without that Contact's public key.

---

### Requirement 14: Journey Planner with "Follow Me" Mode

**User Story:** As a user travelling a planned route, I want to share my journey with trusted contacts so that they can monitor my progress and be alerted if I go off-route.

#### Acceptance Criteria

1. THE App SHALL allow the user to create a Journey by specifying a destination, estimated travel duration (5–480 minutes), and one or more follower Contacts.
2. WHEN a Journey is started, THE App SHALL begin transmitting the user's location to the Backend at intervals of no more than 15 seconds.
3. WHEN a Journey is started, THE Backend SHALL notify all follower Contacts with the journey details and a link to the live tracking view.
4. WHEN the user arrives within 200 metres of the destination, THE App SHALL automatically mark the Journey as complete and notify follower Contacts.
5. WHEN the estimated travel duration expires without the Journey being marked complete, THE Backend SHALL notify follower Contacts and create an active Alert.
6. WHEN the user deviates more than 500 metres from the planned route, THE Risk_Engine SHALL generate a route-deviation warning per Requirement 6.4.
7. THE App SHALL display the active Journey status, elapsed time, and remaining estimated time on the home screen while a Journey is in progress.
8. WHEN the user manually ends a Journey before reaching the destination, THE App SHALL notify follower Contacts that the journey was ended manually.

---

### Requirement 15: Enhanced Fake Call Functionality

**User Story:** As a user in an uncomfortable or potentially dangerous situation, I want a more convincing fake call experience so that I can exit the situation without raising suspicion.

#### Acceptance Criteria

1. THE App SHALL allow the user to configure a fake caller name, phone number display, and a pre-recorded or text-to-speech audio script for the fake call.
2. WHEN the fake call is triggered, THE App SHALL display a full-screen incoming call UI that mimics the device's native call screen appearance.
3. THE App SHALL provide a scheduled fake call option, allowing the user to set a delay of 1–60 minutes before the fake call activates.
4. WHEN the user answers the fake call, THE App SHALL play the configured audio script or synthesise it via the Web Speech API.
5. THE App SHALL allow the user to end the fake call at any time by tapping a hang-up button.
6. WHEN the fake call ends, THE App SHALL return the user to the previous screen without triggering any alerts.
7. THE App SHALL provide at least 3 preset caller profiles (e.g., "Mom", "Boss", "Doctor") selectable without additional configuration.

---

### Requirement 16: Community Safety Map

**User Story:** As a user, I want to see reported safety incidents near me so that I can make informed decisions about my route and surroundings.

#### Acceptance Criteria

1. THE App SHALL display a Community_Map layer on the existing map page showing anonymised incident markers within a 10-kilometre radius of the user's current location.
2. THE Backend SHALL provide an endpoint that returns incident records within a specified bounding box, filtered to the last 72 hours.
3. WHEN a user submits an incident report, THE Backend SHALL store the report with an anonymised location (rounded to 3 decimal places) and an incident category.
4. THE App SHALL support the following incident categories: `crime`, `accident`, `hazard`, `suspicious_activity`, and `other`.
5. WHEN the user taps an incident marker, THE App SHALL display the incident category, anonymised location, time reported, and a report count for that location.
6. THE App SHALL allow the user to upvote an existing incident report to increase its visibility on the map.
7. THE Backend SHALL automatically expire incident records older than 72 hours.
8. THE App SHALL allow the user to toggle the Community_Map layer on and off without leaving the map page.

---

### Requirement 17: Home-Screen Quick-Access Widgets

**User Story:** As a user, I want a home-screen widget or shortcut so that I can trigger SOS or check my safety status without opening the full app.

#### Acceptance Criteria

1. THE App SHALL register PWA shortcuts in the web app manifest for at least the following actions: `SOS`, `Check-in`, and `Fake Call`.
2. WHEN a PWA shortcut is activated, THE App SHALL navigate directly to the relevant feature without displaying the full home screen first.
3. WHERE the device supports the Web Share Target API, THE App SHALL register as a share target to receive location shares from other apps.
4. THE App SHALL provide a dedicated widget configuration page accessible from Settings where the user can select which shortcuts appear.
5. WHEN the App is installed as a PWA, THE App SHALL display an install prompt on first visit if the browser supports installation.

---

### Requirement 18: Voice Command Activation ("Hey Panic Ring, SOS")

**User Story:** As a user with my hands occupied, I want to activate SOS using a wake word so that I can call for help without touching my phone.

#### Acceptance Criteria

1. WHERE the user has enabled voice activation in Settings, THE App SHALL continuously monitor the microphone for the wake phrase "Hey Panic Ring" using the SpeechRecognition API.
2. WHEN the wake phrase "Hey Panic Ring" is detected, THE App SHALL activate the SOS trigger within 2 seconds.
3. WHEN the wake phrase is followed by "SOS" or "help" in the same utterance, THE App SHALL trigger an urgent Alert directly without requiring further confirmation.
4. WHEN the wake phrase is detected without a follow-up command within 5 seconds, THE App SHALL display a confirmation prompt asking the user to confirm the SOS.
5. THE App SHALL apply a 30-second cooldown after each wake-phrase detection to prevent repeated false triggers.
6. WHERE the user has disabled voice activation in Settings, THE App SHALL not monitor the microphone for the wake phrase.
7. WHEN voice activation is active, THE App SHALL display a persistent microphone indicator in the status bar.
8. IF the SpeechRecognition API is unavailable on the device, THEN THE App SHALL display a message in Settings informing the user that voice activation is not supported on their device.
