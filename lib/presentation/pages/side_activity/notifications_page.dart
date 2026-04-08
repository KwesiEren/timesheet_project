import 'package:flutter/material.dart';
import 'package:timesheet_project/shared/theme_control.dart';

import '../../../services/api.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  bool isLoading = true; // To show loading indicator initially

  List<dynamic> _gottenData = [];

  Future<List> getData() async {
    setState(() {
      isLoading = true; // Ensure loading indicator shows while fetching data
    });

    APIServices getData = APIServices();
    try {
      _gottenData = await getData.fetchNotificationData();
      setState(() {
        // gottenGeoData = currentData;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false; // Stop loading when there's an error
      });
    }
    return _gottenData;
  }

  // Method to refresh data when pull-to-refresh is triggered
  Future<void> refreshData() async {
    debugPrint('Refresh started'); // Debugging log
    await getData();
    if (!mounted) return;
    setState(() {
      isLoading = false; // Ensure loading is stopped });
      debugPrint('Refresh finished'); // Debugging log
    });
  }

  @override
  void initState() {
    super.initState();
    getData();
  }

  void _showNotificationDetails(
      BuildContext context, Map<String, dynamic> notification) {
    showDialog(
      context: context,
      builder: (context) {
        return Center(
          child: Container(
            margin: EdgeInsets.all(10),
            decoration: BoxDecoration(
                color: ThemeCtrl.colors.surfaceColor,
                borderRadius: BorderRadius.circular(10)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        notification['title'],
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          Navigator.pop(context);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    notification['description'],
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Received: ${notification['date']}",
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: ThemeCtrl.colors.backgroundColor,
        centerTitle: true,
        title: const Text('Notifications'),
      ),
      backgroundColor: ThemeCtrl.colors.backgroundColor,
      body: isLoading
          ? const Center(
              child:
                  CircularProgressIndicator(), // Show loading indicator while fetching
            )
          : _gottenData.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.notifications_off_outlined,
                        color: ThemeCtrl.colors.textMuted,
                        size: 48.0,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        "No Notifications at this time",
                        style: TextStyle(fontSize: 18, color: Colors.grey),
                      ),
                      // InkWell(
                      //   splashColor: ThemeCtrl.colors.iconPrimary,
                      //   onTap: () {
                      //     debugPrint("refreshed tapped");
                      //     refreshData();
                      //   },
                      //   child: const Card(
                      //     child: SizedBox(
                      //         height: 60,
                      //         width: 70,
                      //         child: Center(child: Text("Refresh"))),
                      //   ),
                      // )
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _gottenData.length,
                  itemBuilder: (context, index) {
                    final notification = _gottenData[index];
                    return GestureDetector(
                      onTap: () {
                        _showNotificationDetails(context, notification);
                      },
                      child: Card(
                        color: ThemeCtrl.colors.highlightLight,
                        elevation: 3,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        margin: const EdgeInsets.only(bottom: 16.0),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: notification['isUnread']
                                ? ThemeCtrl.colors.primaryColor
                                : const Color(0xFFBDBDBD),
                            child: Icon(
                              notification['isUnread']
                                  ? Icons.notifications
                                  : Icons.notifications_off,
                              color: ThemeCtrl.colors.surfaceColor,
                            ),
                          ),
                          title: Text(
                            notification['title'],
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: notification['isUnread']
                                  ? Colors.black
                                  : Colors.grey.shade600,
                            ),
                          ),
                          subtitle: Text(
                            notification['description'],
                            style: const TextStyle(fontSize: 14),
                          ),
                          trailing: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                notification['timestamp'],
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey,
                                ),
                              ),
                              if (notification['isUnread'])
                                Icon(
                                  Icons.circle,
                                  size: 10,
                                  color: ThemeCtrl.colors.buttonPrimary,
                                ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
