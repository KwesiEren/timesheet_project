import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

class GhanaBaseMapScreen extends StatefulWidget {
  @override
  _GhanaBaseMapScreenState createState() => _GhanaBaseMapScreenState();
}

class _GhanaBaseMapScreenState extends State<GhanaBaseMapScreen> {
  final MapController _mapController = MapController();
  // Work coordinates
  final double workLatitude =
      5.7319823787628685; // Replace with your work's latitude
  final double workLongitude =
      -0.07775303995670355; // Replace with your work's longitude
  final double workRadius = 50; // Radius in meters

  LatLng? _currentLocation; // To store user's current location

  // Method to get the user's current location
  Future<void> _updateCurrentLocation() async {
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
        _mapController.move(_currentLocation!, 14); // Center map on location
      });

      await checkIfInSchool(position);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching location: $e')),
      );
    }
  }

  bool isInSchool(Position userPosition) {
    double distance = Geolocator.distanceBetween(
      userPosition.latitude,
      userPosition.longitude,
      workLatitude,
      workLongitude,
    );

    return distance <= workRadius;
  }

  Future<void> checkIfInSchool(Position userPosition) async {
    bool inSchool = isInSchool(userPosition);

    // Show a dialog with the result
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(inSchool ? "In Work Area" : "Out of Work Area"),
          content: Text(inSchool
              ? "You are within the work radius."
              : "You are outside the work radius."),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close the dialog
              },
              child: const Text("OK"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ghana Base Map'),
      ),
      body: FlutterMap(
        mapController: _mapController,
        options: MapOptions(
          center: LatLng(5.730685967584044,
              -0.07757074639172905), // Default to Ghana center
          zoom: 14, // Adjust zoom level
        ),
        children: [
          // Base map layer
          TileLayer(
            urlTemplate:
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", // OpenStreetMap base layer
            subdomains: const ['a', 'b', 'c'],
          ),
          // Marker layer to show the current location
          if (_currentLocation != null)
            MarkerLayer(
              markers: [
                Marker(
                  point: _currentLocation!,
                  builder: (ctx) => const Icon(
                    Icons.location_on,
                    color: Colors.red,
                    size: 40,
                  ),
                ),
              ],
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _updateCurrentLocation,
        tooltip: 'Get Current Location',
        child: const Icon(Icons.my_location),
      ),
    );
  }
}
