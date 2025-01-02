import 'package:flutter/material.dart';
import 'package:timesheet_project/presentation/sketchs/testpage.dart';

import '../../../models/activity.dart';
import '../../../services/api.dart';
import '../../../shared/theme_control.dart';

class ActivitiesPage extends StatefulWidget {
  const ActivitiesPage({super.key});

  @override
  State<ActivitiesPage> createState() => _ActivitiesPageState();
}

class _ActivitiesPageState extends State<ActivitiesPage> {
  int _currentIndex = 2;
  bool isLoading = true; // To show loading indicator initially

  List<dynamic> _gottenData = [];

  Future<List> getData() async {
    setState(() {
      isLoading = true; // Ensure loading indicator shows while fetching data
    });

    APIServices getData = APIServices();
    try {
      _gottenData = await getData.fetchActivityData();
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
                          Icons.list_alt_rounded,
                          color: ThemeCtrl.colors.color6,
                          size: 48.0,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          "No Task available",
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                        // InkWell(
                        //   splashColor: ThemeCtrl.colors.coloricn,
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
                          child: RefreshIndicator(
                            onRefresh:
                                refreshData, // Call refreshData on pull down,
                            child: ListView.builder(
                              itemCount: _gottenData.length,
                              itemBuilder: (context, index) {
                                final activity = _gottenData[index];
                                return Column(
                                  children: [
                                    ListTile(
                                      leading: activity.isCompleted!
                                          ? const Icon(
                                              Icons.task_alt, // Tick icon
                                              color: Colors.green)
                                          : const Icon(
                                              Icons
                                                  .hourglass_bottom_rounded, // Tick icon
                                              color: Colors.grey),
                                      title: Text(
                                        activity.title as String,
                                        style: const TextStyle(
                                            fontSize: 20,
                                            fontWeight: FontWeight.w500),
                                      ),
                                      subtitle: Text(
                                        '${activity.startTime!.hour}:${activity.startTime!.minute} - ${activity.endTime!.hour}:${activity.endTime!.minute}',
                                        style: const TextStyle(fontSize: 15),
                                      ),
                                    ),
                                    Divider(
                                      color: ThemeCtrl.colors.color2,
                                      indent: screen.width *
                                          0.05, // 3% of screen width
                                      endIndent: screen.width * 0.05,
                                      height: screen.height *
                                          0.01, // 1% of screen height
                                    )
                                  ],
                                );
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
        floatingActionButton: FloatingActionButton(
          foregroundColor: ThemeCtrl.colors.color3,
          backgroundColor: ThemeCtrl.colors.colorbtn1,
          shape: const CircleBorder(),
          onPressed: () {},
          child: const Icon(
            Icons.add,
            size: 30,
          ),
        ));
  }
}
