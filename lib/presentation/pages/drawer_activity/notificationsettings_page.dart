import 'package:flutter/material.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});

  @override
  _NotificationSettingsPageState createState() =>
      _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  bool notificationsEnabled = true;
  bool soundEnabled = true;
  bool vibrationEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          SwitchListTile(
            title: const Text('Enable Notifications'),
            subtitle: const Text('Turn all notifications on or off'),
            value: notificationsEnabled,
            onChanged: (value) {
              setState(() {
                notificationsEnabled = value;
              });
            },
          ),
          const Divider(),
          SwitchListTile(
            title: const Text('Notification Sound'),
            subtitle: const Text('Play sound for notifications'),
            value: soundEnabled,
            onChanged: notificationsEnabled
                ? (value) {
                    setState(() {
                      soundEnabled = value;
                    });
                  }
                : null,
          ),
          const Divider(),
          SwitchListTile(
            title: const Text('Vibration'),
            subtitle: const Text('Vibrate for notifications'),
            value: vibrationEnabled,
            onChanged: notificationsEnabled
                ? (value) {
                    setState(() {
                      vibrationEnabled = value;
                    });
                  }
                : null,
          ),
          const Divider(),
          ListTile(
            title: const Text('Notification Preferences'),
            subtitle: const Text('Customize your notification types'),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: notificationsEnabled
                ? () {
                    // Navigate to detailed settings (if needed)
                  }
                : null,
          ),
        ],
      ),
    );
  }
}
