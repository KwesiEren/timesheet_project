import 'package:flutter/material.dart';

import '../../shared/theme_control.dart';

class AnnouncementPage extends StatefulWidget {
  const AnnouncementPage({super.key});

  @override
  State<AnnouncementPage> createState() => _AnnouncementPageState();
}

class _AnnouncementPageState extends State<AnnouncementPage> {
  int _currentIndex = 3;

  List<Map<String, String>> announcements = [
    {
      "title": "System Maintenance",
      "description": "The system will be down for maintenance on Jan 1, 2024.",
      "date": "Dec 28, 2024",
    },
    {
      "title": "New Feature Release",
      "description":
          "We are excited to introduce a new feature to enhance user experience.",
      "date": "Dec 27, 2024",
    },
    {
      "title": "Holiday Schedule",
      "description": "The office will be closed for the upcoming holidays.",
      "date": "Dec 25, 2024",
    },
  ];

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: ThemeCtrl.colors.colorbg,
      body: SafeArea(
        child: Center(
          child: Column(
            children: [
              SizedBox(
                height: screen.height * 0.05,
              ),
              Container(
                padding: const EdgeInsets.all(8),
                width: screen.width * 0.95,
                height: screen.height * 0.75,
                // decoration: BoxDecoration(color: Colors.amber),
                child: ListView.builder(
                  itemCount: announcements.length,
                  itemBuilder: (context, index) {
                    final announcement = announcements[index];
                    return Card(
                      color: ThemeCtrl.colors.color3,
                      margin: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 16),
                      elevation: 4,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              announcement['title']!,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              announcement['description']!,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 14),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  announcement['date']!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                                TextButton(
                                  onPressed: () {},
                                  child: Text(
                                    'Read More',
                                    style: TextStyle(
                                        color: ThemeCtrl.colors.colorbtn1),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
