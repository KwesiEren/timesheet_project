// import 'package:flutter/material.dart';
// import '../../shared/img_constant.dart';

// class Login extends StatelessWidget {
//   const Login({Key? key}) : super(key: key);

//   @override
//   Widget build(BuildContext context) {
//     var screen = MediaQuery.of(context).size;
//     return Scaffold(
//       backgroundColor: Colors.white,
//       body: SingleChildScrollView(
//         child: Column(
//           children: [
//             // Top Section with Curves
//             Stack(
//               children: [
//                 ClipPath(
//                   clipper: TopCurveClipper(),
//                   child: Container(
//                     height: screen.height * 0.39, //400,
//                     decoration: const BoxDecoration(
//                         image: DecorationImage(
//                             image: AssetImage(ImgAssets.splashBg),
//                             fit: BoxFit.cover)
//                         // gradient: LinearGradient(
//                         //   colors: [Color(0xFF2E7D32), Color(0xFF4CAF50)],
//                         //   begin: Alignment.topCenter,
//                         //   end: Alignment.bottomCenter,
//                         // ),
//                         ),
//                   ),
//                 ),
//                 Positioned(
//                   top: 50,
//                   left: 16,
//                   child: IconButton(
//                     onPressed: () {},
//                     icon: const Icon(Icons.arrow_back_ios_new_rounded,
//                         color: Colors.white, size: 24),
//                   ),
//                 ),
//                 // Positioned(
//                 //   left: 258,
//                 //   top: 190,
//                 //   child: Container(
//                 //     //   margin: const EdgeInsets.only(left: 280,
//                 //     // top: 200),
//                 //     height: screen.height * 0.12, //120,
//                 //     width: screen.width * 0.3, //120,
//                 //     decoration: const BoxDecoration(
//                 //         // color: Colors.amber,
//                 //         image: DecorationImage(
//                 //             opacity: 0.1,
//                 //             image: AssetImage(ImgAssets.imgSat),
//                 //             fit: BoxFit.contain)),
//                 //   ),
//                 // )
//               ],
//             ),

//             // Login Form
//             Container(
//               height: screen.height * 0.61,
//               // color: Colors.amber,
//               padding: const EdgeInsets.all(20),
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.center,
//                 children: [
//                   const Text(
//                     "Welcome Back",
//                     style: TextStyle(
//                       fontSize: 28,
//                       fontWeight: FontWeight.bold,
//                       color: Color(0xFF03296E),
//                     ),
//                   ),
//                   const SizedBox(height: 8),
//                   const Text(
//                     "Login to your account",
//                     style: TextStyle(color: Colors.grey),
//                   ),
//                   const SizedBox(height: 24),

//                   // Full Name TextField
//                   _buildTextField(
//                     hint: "Full Name",
//                     icon: Icons.person_outline,
//                   ),
//                   const SizedBox(height: 16),

//                   // Password TextField
//                   _buildTextField(
//                     hint: "Password",
//                     icon: Icons.lock_outline,
//                     obscureText: true,
//                     suffixIcon: Icons.visibility_outlined,
//                   ),

//                   const SizedBox(height: 16),

//                   // Remember Me and Forgot Password
//                   Row(
//                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                     children: [
//                       Row(
//                         children: [
//                           Checkbox(
//                               activeColor: const Color(0xFF0432A0),
//                               value: true,
//                               onChanged: (val) {}),
//                           const Text("Remember Me"),
//                         ],
//                       ),
//                       GestureDetector(
//                         onTap: () {},
//                         child: const Text(
//                           "Forgot Password?",
//                           style: TextStyle(
//                               color: Color(0xFF03296E),
//                               fontWeight: FontWeight.w600),
//                         ),
//                       ),
//                     ],
//                   ),
//                   const SizedBox(height: 35),

//                   // Login Button
//                   SizedBox(
//                     width: double.infinity,
//                     height: 50,
//                     child: ElevatedButton(
//                       style: ElevatedButton.styleFrom(
//                         backgroundColor: const Color.fromARGB(255, 7, 63, 194),
//                         shape: RoundedRectangleBorder(
//                           borderRadius: BorderRadius.circular(12),
//                         ),
//                       ),
//                       onPressed: () {},
//                       child: const Text(
//                         "Login",
//                         style: TextStyle(fontSize: 18, color: Colors.white),
//                       ),
//                     ),
//                   ),
//                   const SizedBox(height: 24),
//                 ],
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   // Custom TextField Widget
//   Widget _buildTextField({
//     required String hint,
//     required IconData icon,
//     bool obscureText = false,
//     IconData? suffixIcon,
//   }) {
//     return TextField(
//       obscureText: obscureText,
//       decoration: InputDecoration(
//         prefixIcon: Icon(icon, color: const Color(0xFF03296E)),
//         hintText: hint,
//         hintStyle: const TextStyle(
//           color: Color(0xFF4A4A4A),
//         ),
//         suffixIcon:
//             suffixIcon != null ? Icon(suffixIcon, color: Colors.grey) : null,
//         filled: true,
//         fillColor: Colors.blue.shade50,
//         border: OutlineInputBorder(
//           borderRadius: BorderRadius.circular(12),
//           borderSide: BorderSide.none,
//         ),
//       ),
//     );
//   }
// }

// // Custom Clipper for Top Curve
// class TopCurveClipper extends CustomClipper<Path> {
//   @override
//   Path getClip(Size size) {
//     Path path = Path();
//     path.lineTo(0, size.height * 0.95); // Start at 65% of height on the left

//     path.quadraticBezierTo(
//       size.width / 1.8,
//       size.height * 0.92, // Control Point: slightly below center
//       size.width,
//       size.height * 0.50, // End Point: 65% height on the right
//     );

//     path.lineTo(size.width, 0); // Straight to the top-right corner
//     path.close();

//     return path;
//   }

//   @override
//   bool shouldReclip(covariant CustomClipper<Path> oldClipper) {
//     return false;
//   }
// }
