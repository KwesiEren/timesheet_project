import 'package:flutter/material.dart';

import '../../shared/components/curve_design.dart';
import '../../shared/components/inputfield_w_icon.dart';
import '../../shared/img_constant.dart';
import '../../shared/theme_control.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _emailController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      // appBar: AppBar(
      //   title: const Text('Rest Password Screen'),
      //   centerTitle: true,
      // ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Section with Curves
            Stack(
              children: [
                ClipPath(
                  clipper: TopCurveClipper(),
                  child: Container(
                    height: screen.height * 0.35, //400,
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
              ],
            ),

            // Login Form
            Container(
              height: screen.height * 0.65,
              // color: Colors.amber,
              padding: const EdgeInsets.only(left: 20, right: 20, bottom: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    "Reset Password",
                    style: TextStyle(
                      fontFamily: 'Pacifico',
                      fontSize: 30,
                      fontWeight: FontWeight.bold,
                      color: ThemeCtrl.colors.colortxt1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Recover your account",
                    style: TextStyle(color: ThemeCtrl.colors.color6),
                  ),
                  const SizedBox(height: 24),

                  // Full Name TextField
                  InputField1(
                    hint: "Enter User\'s Email Here",
                    icon: Icons.mail,
                    controller: _emailController,
                  ),
                  const SizedBox(height: 15),

                  const SizedBox(height: 70),

                  // Login Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ThemeCtrl.colors.colorbtn1,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {},
                      child: Text(
                        "Reset Password",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: ThemeCtrl.colors.colorw,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    textAlign: TextAlign.justify,
                    "NOTE:\nIf you have trouble reseting your account, contact your admin and they could assist you. Thank You!",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w300,
                      color: Color.fromARGB(141, 2, 2, 2),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
