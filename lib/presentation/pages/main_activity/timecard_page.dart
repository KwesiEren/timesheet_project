import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';
import 'package:timesheet_project/presentation/pages/side_activity/checkin_page.dart';
import 'package:timesheet_project/shared/components/button_1.dart';
import 'package:timesheet_project/shared/theme_control.dart';
import 'package:timesheet_project/controllers/auth_controller.dart';
import 'package:timesheet_project/controllers/report_controller.dart';

import '../../../services/api.dart';

class PunchInPage extends StatefulWidget {
  const PunchInPage({super.key});

  @override
  State<PunchInPage> createState() => _PunchInPageState();
}

class _PunchInPageState extends State<PunchInPage> {
  final AuthController authController = Get.find<AuthController>();
  final ReportController reportController = Get.put(ReportController());
  
  int _currentIndex = 1;
  bool inWork = false;
  // Work coordinates = 5.6513043230251565, -0.18293191893145516
  final double workLatitude =
      5.6513043230251565; // Replace with your work's latitude
  final double workLongitude =
      -0.18293191893145516; // Replace with your work's longitude
  final double workRadius = 130; // Radius in meters

  LatLng? _currentLocation; // To store user's current location
  bool isLoading = true; // To show loading indicator initially
  bool isLoading2 = true;

  List<dynamic> _gottenData = [];

  Future<List> getData() async {
    setState(() {
      isLoading = true; // Ensure loading indicator shows while fetching data
    });

    APIServices getData = APIServices();
    try {
      _gottenData = await getData.fetchEmployeeData();
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

  // Method to get the user's current location
  Future<void> _updateCurrentLocation() async {
    setState(() {
      isLoading2 = true;
    });
    if (isLoading2 == true) {
      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false, // Prevent dismissing by tapping outside
        builder: (BuildContext context) {
          return AlertDialog(
            content: Row(
              children: [
                const CircularProgressIndicator(),
                const SizedBox(width: 16),
                Text("Checking Location .....",
                    style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          );
        },
      );

      Navigator.of(context).pop();
    }
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location services are disabled.')),
        );
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        permission = await Geolocator.requestPermission();
        if (permission != LocationPermission.whileInUse &&
            permission != LocationPermission.always) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permissions are denied.')),
          );
          return;
        }
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _currentLocation = LatLng(position.latitude, position.longitude);
        // _mapController.move(_currentLocation!, 14); // Center map on location
      });

      await checkIfInWork(position);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching location: $e')),
      );
    }
  }

  bool isInWork(Position userPosition) {
    double distance = Geolocator.distanceBetween(
      userPosition.latitude,
      userPosition.longitude,
      workLatitude,
      workLongitude,
    );

    return distance <= workRadius;
  }

  Future<void> checkIfInWork(Position userPosition) async {
    setState(() {
      inWork = isInWork(userPosition);
    });

    // Show a dialog with the result
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(inWork ? "In Work Area" : "Out of Work Area"),
          content: Text(inWork
              ? "You are within the work radius."
              : "You are outside the work radius."),
          actions: [
            TextButton(
              onPressed: () {
                if (inWork) {
                  Navigator.of(context).pop(); // Close the dialog
                  _toNextScreen(PunchInScreen());
                } else {
                  Navigator.of(context).pop(); // Close the dialog
                }
              },
              child: const Text("OK"),
            ),
          ],
        );
      },
    );
    setState(() {
      isLoading2 = false; // Ensure loading is stopped });
      debugPrint('Refresh finished'); // Debugging log
    });
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

  // Method to navigate to the next screen
  void _toNextScreen(Widget destination) async {
    Get.to(() => destination);
  }

  // Method to navigate to the previous screen
  // void _toPreviousScreen() async {
  //   Get.back();
  // }

  @override
  void initState() {
    super.initState();
    getData();
  }

  // UI code block;
  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: ThemeCtrl.colors.backgroundColor,
      body: Center(
        child: Column(
          // crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: screen.height * 0.05,
            ),

            // History display container
            Container(
              padding: const EdgeInsets.all(5),
              width: screen.width * 0.8,
              height: screen.height * 0.45,
              decoration: BoxDecoration(
                color: ThemeCtrl.colors.surfaceColor,
                borderRadius: BorderRadius.circular(10),
                // boxShadow: const [
                //   BoxShadow(
                //       color: Color(0x73140606),
                //       offset: Offset(2, 3),
                //       blurRadius: 8)
                // ]
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'History',
                        style: TextStyle(fontSize: 25),
                      ),
                      if (authController.isManagement) ...[
                        const SizedBox(width: 10),
                        Obx(() => reportController.isLoading.value 
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : IconButton(
                              icon: const Icon(Icons.picture_as_pdf, color: Colors.redAccent),
                              onPressed: () {
                                final now = DateTime.now();
                                final firstDayOfMonth = DateTime(now.year, now.month, 1);
                                reportController.exportAndShare(
                                  userId: authController.currentUser?.id ?? '',
                                  userName: authController.currentUser?.name ?? 'User',
                                  startDate: firstDayOfMonth,
                                  endDate: now,
                                );
                              },
                              tooltip: 'Export Payroll PDF',
                            ),
                        ),
                      ],
                    ],
                  ),
                  Divider(
                    indent: screen.width * 0.06, // 3% of screen width
                    endIndent: screen.width * 0.06,
                    height: screen.height * 0.01, // 1% of screen height

                    color: const Color(0x6D000000),
                  ),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Text(
                        'Date',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w300),
                      ),
                      Text(
                        'Check-in',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w300),
                      ),
                      Text(
                        'Check-out',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w300),
                      ),
                    ],
                  ),
                  Container(
                    width: screen.width * 0.75,
                    height: screen.height * 0.343,
                    color: const Color(0x002195F3),
                    child: RefreshIndicator(
                      onRefresh: refreshData,
                      child: isLoading
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
                                        Icons.history_toggle_off_rounded,
                                        color: ThemeCtrl.colors.textMuted,
                                        size: 48.0,
                                      ),
                                      const SizedBox(height: 16),
                                      const Text(
                                        "No History Now",
                                        style: TextStyle(
                                            fontSize: 18, color: Colors.grey),
                                      ),
                                      InkWell(
                                        splashColor: ThemeCtrl.colors.iconPrimary,
                                        onTap: () {
                                          debugPrint("refreshed tapped");
                                          refreshData();
                                        },
                                        child: SizedBox(
                                            height: 60,
                                            width: 70,
                                            child: Center(
                                                child: Text(
                                              "Refresh",
                                              style: TextStyle(
                                                  decoration:
                                                      TextDecoration.underline,
                                                  color: ThemeCtrl
                                                      .colors.iconPrimary),
                                            ))),
                                      )
                                    ],
                                  ),
                                )
                              : ListView.builder(
                                  itemCount: _gottenData.length,
                                  itemBuilder: (context, index) {
                                    final employeeDay = _gottenData[index];
                                    return SizedBox(
                                      child: Column(
                                        children: [
                                          ListTile(
                                            leading: Text('${index + 1}'),
                                            title: Text(
                                              'Date: ${employeeDay.arrivalTime.toLocal().toString().split(' ')[0]}',
                                            ),
                                            subtitle: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                    'Check-in: ${employeeDay.arrivalTime.hour}:${employeeDay.arrivalTime.minute}'),
                                                Text(
                                                    'Check-out: ${employeeDay.departureTime.hour}:${employeeDay.departureTime.minute}'),
                                              ],
                                            ),
                                          ),
                                          Divider(
                                            indent: screen.width *
                                                0.05, // 3% of screen width
                                            endIndent: screen.width * 0.05,
                                            height: screen.height *
                                                0.01, // 1% of screen height
                                          )
                                        ],
                                      ),
                                    );
                                  },
                                ),
                    ),
                  )
                ],
              ),
            ),
            SizedBox(
              height: screen.height * 0.1,
            ),
            ActionButton1(
                onPressed: () async {
                  _updateCurrentLocation();
                },
                text: 'Check In',
                txtcolor: ThemeCtrl.colors.highlightLight,
                btnWidth: screen.width * 0.7,
                btnHeight: 80,
                size: 30,
                btnColor: ThemeCtrl.colors.buttonPrimary,
                borderRadius: 5)
          ],
        ),
      ),
    );
  }
}
