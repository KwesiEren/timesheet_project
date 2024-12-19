import 'package:flutter/material.dart';
import 'package:timesheet_project/shared/components/inputfield_w_icon.dart';
import '../../shared/img_constant.dart';
import '../../shared/components/curve_design.dart';
import 'package:timesheet_project/shared/button_1.dart';
import 'package:timesheet_project/shared/theme_control.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  String? _username;
  String? _password;

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Section with Curves
            Stack(
              children: [
                ClipPath(
                  clipper: TopCurveClipper(),
                  child: Container(
                    height: screen.height * 0.39, //400,
                    decoration: const BoxDecoration(
                        image: DecorationImage(
                            image: AssetImage(ImgAssets.splashBg),
                            fit: BoxFit.cover)
                        // gradient: LinearGradient(
                        //   colors: [Color(0xFF2E7D32), Color(0xFF4CAF50)],
                        //   begin: Alignment.topCenter,
                        //   end: Alignment.bottomCenter,
                        // ),
                        ),
                  ),
                ),
                Positioned(
                  top: 50,
                  left: 16,
                  child: IconButton(
                    onPressed: () {},
                    icon: const Icon(Icons.arrow_back_ios_new_rounded,
                        color: Colors.white, size: 24),
                  ),
                ),
                // Positioned(
                //   left: 258,
                //   top: 190,
                //   child: Container(
                //     //   margin: const EdgeInsets.only(left: 280,
                //     // top: 200),
                //     height: screen.height * 0.12, //120,
                //     width: screen.width * 0.3, //120,
                //     decoration: const BoxDecoration(
                //         // color: Colors.amber,
                //         image: DecorationImage(
                //             opacity: 0.1,
                //             image: AssetImage(ImgAssets.imgSat),
                //             fit: BoxFit.contain)),
                //   ),
                // )
              ],
            ),

            // Login Form
            Container(
              height: screen.height * 0.61,
              // color: Colors.amber,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    "Welcome Back",
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF03296E),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Login to your account",
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),

                  // Full Name TextField
                  InputField1(
                    hint: "Email",
                    icon: Icons.mail,
                  ),
                  const SizedBox(height: 16),

                  // Password TextField
                  InputField1(
                    hint: "Password",
                    icon: Icons.lock,
                    hideText: true,
                    suffixIcon: Icons.visibility_outlined,
                  ),

                  const SizedBox(height: 16),

                  // Remember Me and Forgot Password
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Checkbox(
                              activeColor: Color(0xFF0432A0),
                              value: true,
                              onChanged: (val) {}),
                          const Text("Remember Me"),
                        ],
                      ),
                      GestureDetector(
                        onTap: () {},
                        child: const Text(
                          "Forgot Password?",
                          style: TextStyle(
                              color: Color(0xFF03296E),
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 35),

                  // Login Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color.fromARGB(255, 7, 63, 194),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {},
                      child: const Text(
                        "Login",
                        style: TextStyle(fontSize: 18, color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
    // appBar: AppBar(
    //   title: const Text('Login Screen'),
    //   centerTitle: true,
    // ),
    // body: SingleChildScrollView(
    //   child: Container(
    //     width: screen.width,
    //     height: screen.height,
    //     decoration: const BoxDecoration(
    //         image: DecorationImage(
    //             image: AssetImage(ImgAssets.imgBg), fit: BoxFit.cover)),
    //     child: Container(
    //       // width: screen.width,
    //       // height: screen.height,
    //       padding: const EdgeInsets.all(10),
    //       // color: ThemeCtrl.colors.colorbg,
    //       child: Column(
    //         children: [
    //           SizedBox(
    //             height: 20,
    //           ),
    //           Container(
    //             width: screen.width * 0.8,
    //             height: screen.height * 0.2,
    //             decoration: const BoxDecoration(
    //                 //  color: ThemeCtrl.colors.colorbg,
    //                 image: DecorationImage(
    //                     image: AssetImage(ImgAssets.appLogo),
    //                     fit: BoxFit.cover)),
    //           ),
    //           SizedBox(
    //             height: 70,
    //           ),
    //           Form(
    //             key: _formKey,
    //             child: Column(
    //               mainAxisAlignment: MainAxisAlignment.center,
    //               children: [
    //                 Padding(
    //                   padding: const EdgeInsets.only(left: 5.0, right: 5.0),
    //                   child: Column(
    //                     children: [
    //                       Column(
    //                         crossAxisAlignment: CrossAxisAlignment.start,
    //                         children: [
    //                           Text(
    //                             'Email',
    //                             style: TextStyle(
    //                               fontFamily: 'Comfortaa',
    //                               fontSize: 15,
    //                               color: ThemeCtrl.colors.colortxt1,
    //                             ),
    //                           ),
    //                           Container(
    //                             decoration: BoxDecoration(
    //                                 color: const Color.fromARGB(
    //                                     255, 247, 247, 247),
    //                                 borderRadius: BorderRadius.circular(5),
    //                                 border: Border.all(
    //                                     color: const Color.fromARGB(
    //                                         122, 0, 0, 0))),
    //                             child: TextFormField(
    //                               decoration: const InputDecoration(
    //                                   contentPadding:
    //                                       EdgeInsets.only(left: 5),
    //                                   // filled: true,
    //                                   border: InputBorder.none,
    //                                   hintText: 'JohnDoe@yahoo.com',
    //                                   hintStyle: TextStyle(
    //                                       color:
    //                                           Color.fromARGB(103, 0, 0, 0))),
    //                               validator: (value) {
    //                                 if (value == null || value.isEmpty) {
    //                                   return 'Email will remain unchanged if empty';
    //                                 }
    //                                 if (!RegExp(
    //                                         r'^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$')
    //                                     .hasMatch(value)) {
    //                                   return 'Enter a valid Email address';
    //                                 }
    //                                 return null;
    //                               },
    //                               onSaved: (value) {
    //                                 _username = value!;
    //                               },
    //                             ),
    //                           ),
    //                           SizedBox(
    //                             height: 40,
    //                           ),
    //                           Text(
    //                             'Password',
    //                             style: TextStyle(
    //                               fontFamily: 'Comfortaa',
    //                               fontSize: 15,
    //                               color: ThemeCtrl.colors.colortxt1,
    //                             ),
    //                           ),
    //                           Container(
    //                             decoration: BoxDecoration(
    //                                 color: const Color.fromARGB(
    //                                     255, 247, 247, 247),
    //                                 borderRadius: BorderRadius.circular(5),
    //                                 border: Border.all(
    //                                     color: const Color.fromARGB(
    //                                         122, 0, 0, 0))),
    //                             child: TextFormField(
    //                               obscureText: true,
    //                               obscuringCharacter: '*',
    //                               decoration: const InputDecoration(
    //                                   contentPadding:
    //                                       EdgeInsets.only(left: 5),
    //                                   // filled: true,
    //                                   border: InputBorder.none,
    //                                   hintText: '********',
    //                                   hintStyle: TextStyle(
    //                                       color:
    //                                           Color.fromARGB(103, 0, 0, 0))),
    //                               validator: (value) {
    //                                 if (value == null || value.isEmpty) {
    //                                   return 'Password is needed';
    //                                 }
    //                                 if (value.length < 8) {
    //                                   return 'Password must be at least 8 characters long.';
    //                                 }
    //                                 return null;
    //                               },
    //                               onSaved: (value) {
    //                                 _password = value!;
    //                               },
    //                             ),
    //                           ),
    //                         ],
    //                       ),
    //                       SizedBox(
    //                         height: 20,
    //                       ),
    //                       Row(
    //                         mainAxisAlignment: MainAxisAlignment.end,
    //                         children: [
    //                           ActionButton1(
    //                             text: 'Sign In',
    //                             btnColor: ThemeCtrl.colors.colorbtn1,
    //                             size: 20,
    //                             borderRadius: 5,
    //                           ),
    //                         ],
    //                       ),
    //                       SizedBox(
    //                         height: 130,
    //                       ),
    //                       Text(
    //                         'v1.0',
    //                         textAlign: TextAlign.center,
    //                         // 'This application is designed for employess of CERSGIS only!\n Please delete if you don\'t find yourself in the demographic.\nTHANK YOU!',
    //                         style: TextStyle(
    //                             fontSize: 20,
    //                             fontFamily: 'Pacifico',
    //                             color: ThemeCtrl.colors.color4),
    //                       )
    //                     ],
    //                   ),
    //                 )
    //               ],
    //             ),
    //           ),
    //         ],
    //       ),
    //     ),
    //   ),
    // ));
  }
}
