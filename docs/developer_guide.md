# Developer Guide

This guide provides technical information for developers working on the Timesheet Project.

## 🛠 Tech Stack

- **Framework**: [Flutter](https://flutter.dev/) (v3.5.4+)
- **State Management**: [GetX](https://pub.dev/packages/get)
- **Local Storage**: [Get Storage](https://pub.dev/packages/get_storage)
- **HTTP Client**: [Dio](https://pub.dev/packages/dio)
- **Icons & Assets**: Cupertino Icons, FontAwesome (via assets)

## 📁 Project Structure

The project follows a modified Clean Architecture / Controller-Service pattern:

```text
lib/
├── controllers/          # GetX Controllers for business logic (Auth, Timesheet)
├── data/                 # Data layer (Providers, Repositories, API Clients)
├── models/               # Data models (Activity, Employee, User)
├── presentation/         # UI layer
│   ├── pages/            # Individual screen implementations
│   ├── widgets/          # Shared/Reusable UI widgets
│   └── sketchs/          # UI sketches/experimental UI code
├── routes/               # App routing configuration
├── services/             # Low-level infrastructure services
└── shared/               # Shared constants, themes, and styles
```

## 🚀 Setting Up the Development Environment

1. **Prerequisites**:
   - Install Flutter SDK (Stable channel).
   - Install Android Studio or VS Code with Flutter/Dart extensions.
   - Configure an Android Emulator or iOS Simulator.

2. **Initialization**:
   ```bash
   flutter pub get
   ```

3. **Backend Configuration**:
   - The app expects the API at `http://localhost:3000` (iOS/Web) or `http://10.0.2.2:3000` (Android Emulator).
   - Update `lib/data/providers/api_client.dart` if your backend is hosted elsewhere.

4. **Running the App**:
   ```bash
   flutter run
   ```

## 🧠 Core Controllers

### `AuthController`
- Manages user login, registration, and logout.
- Checks authentication state on app startup.
- Persists user tokens and profiles using `LocalStorageProvider`.

### `TimesheetController`
- Handles activity timers (start/pause/stop).
- Syncs local activity data with the backend.
- Manages current "On Duty" status (arrival/departure).

## 🔌 API Client & Interceptors

The app uses a centralized `ApiClient` (powered by Dio) located in `lib/data/providers/api_client.dart`.
- **Interceptors**: Automatically adds the `Authorization: Bearer <token>` header to all requests if the user is logged in.
- **Error Handling**: Centralized error mapping for network or server issues.

## 🎨 Design System

- **Typography**: Custom fonts (Pacifico, Comfortaa, Playwrite) are defined in `pubspec.yaml` and used across the app.
- **Themes**: Shared style constants for colors and gradients are located in `lib/shared/`.
- **Responsiveness**: The app uses flexible layouts to support various screen sizes.

## 🤝 Contribution Guidelines

- **Branching**: Use descriptive branch names (e.g., `feature/login-ui`, `fix/activity-timer`).
- **Code Style**: Follow the official [Dart style guide](https://dart.dev/guides/language/effective-dart/style).
- **Lints**: Ensure `flutter analyze` passes before committing.
- **Testing**: Add or update tests in the `test/` directory for any new logic in controllers or models.
