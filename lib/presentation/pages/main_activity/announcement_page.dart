import 'package:flutter/material.dart';

import '../../../services/api.dart';
import '../../../shared/theme_control.dart';

class AnnouncementPage extends StatefulWidget {
  const AnnouncementPage({super.key});

  @override
  State<AnnouncementPage> createState() => _AnnouncementPageState();
}

class _AnnouncementPageState extends State<AnnouncementPage> {
  int _currentIndex = 3;
  List<dynamic> _gottenData = [];
  bool isLoading = true; // To show loading indicator initially

  //Logics used in the Dashboard screen here;

  Future<List> getData() async {
    setState(() {
      isLoading = true; // Ensure loading indicator shows while fetching data
    });

    APIServices getData = APIServices();
    try {
      _gottenData = await getData.fetchAnnouncementData();
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

  // Shows Popup DIalog box
  void _showAnnouncementDetails(
      BuildContext context, Map<String, dynamic> announcement) {
    showDialog(
      context: context,
      builder: (context) {
        return Center(
          child: Container(
            margin: EdgeInsets.all(10),
            decoration: BoxDecoration(
                color: ThemeCtrl.colors.colorw,
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
                        announcement['title'],
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
                    announcement['description'],
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Received: ${announcement['date']}",
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

  // UI Code block here
  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: ThemeCtrl.colors.colorbg,
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
                        Icons.announcement_outlined,
                        color: ThemeCtrl.colors.color6,
                        size: 48.0,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        "No Announcement for now",
                        style: TextStyle(fontSize: 18, color: Colors.grey),
                      ),
                    ],
                  ),
                )
              : Center(
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
                          itemCount: _gottenData.length,
                          itemBuilder: (context, index) {
                            final announcement = _gottenData[index];
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
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          announcement['date']!,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                          ),
                                        ),
                                        TextButton(
                                          onPressed: () {
                                            _showAnnouncementDetails(
                                                context, announcement);
                                          },
                                          child: Text(
                                            'Read More',
                                            style: TextStyle(
                                                color:
                                                    ThemeCtrl.colors.colorbtn1),
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
    );
  }
}
