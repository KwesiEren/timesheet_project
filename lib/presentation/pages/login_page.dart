import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:timesheet_project/presentation/pages/resetpassword_page.dart';
import '../../shared/img_constant.dart';
import '../../shared/components/curve_design.dart';
import '../../shared/theme_control.dart';

import '../../shared/components/inputfield_w_icon.dart';
import '../sketchs/dashboard.dart';
import 'dashboard_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _keepLogin = false;
  bool _hidePassword = true;

  // All Logic used on screen below;

  //1. on login click
  void _submitForm() async {
    String? _userEmail = _emailController.text;
    String? _password = _passwordController.text;

    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      print('Email: $_userEmail, Password: $_password');

      // Call the callback and pop the screen
      Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (BuildContext context) => const DashboardPage()));

      // Clear the form after submission
      // _clearForm();
    } else {
      // If validation fails, feedback is already shown by TextFormField
      print('Validation failed');
    }
  }

  // Function to clear form fields
  // void _clearForm() {
  //   setState(() {
  //   });
  // }

  //2. on checkbox click
  void _toggleCheckBox(bool val) async {
    // Update the state
    setState(() {
      // Toggle the status

      _keepLogin = !_keepLogin;
    });
  }

  @override
  void dispose() {
    //To clear the TextField
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

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
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      "Welcome Back",
                      style: TextStyle(
                        fontFamily: 'Pacifico',
                        fontSize: 30,
                        fontWeight: FontWeight.bold,
                        color: ThemeCtrl.colors.colortxt1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Login to your account",
                      style: TextStyle(color: ThemeCtrl.colors.color6),
                    ),
                    const SizedBox(height: 24),

                    // Full Name TextField
                    InputField1(
                      hint: "Email",
                      icon: Icons.mail,
                      controller: _emailController,
                    ),
                    const SizedBox(height: 15),

                    // Password TextField
                    InputField1(
                      hint: "Password",
                      icon: Icons.lock,
                      hideText: _hidePassword,
                      controller: _passwordController,
                      suffixIcon: Icons.visibility_outlined,
                      callback: () {
                        setState(() {
                          _hidePassword = !_hidePassword;
                        });
                      },
                    ),

                    // const SizedBox(height: 1),

                    // Remember Me and Forgot Password
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Transform.scale(
                              scale: 0.8,
                              child: Checkbox(
                                  activeColor: ThemeCtrl.colors.colorbtn1,
                                  value: _keepLogin,
                                  onChanged: (value) {
                                    _toggleCheckBox(value!);
                                  }),
                            ),
                            const Text(
                              "Remember Me",
                              style: TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                        GestureDetector(
                          onTap: () {
                            Get.to(const ResetPasswordPage());
                          },
                          child: Text(
                            "Forgot Password?",
                            style: TextStyle(
                                color: ThemeCtrl.colors.colortxt1,
                                fontSize: 12,
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
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
                        onPressed: _submitForm,
                        child: Text(
                          "Login",
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: ThemeCtrl.colors.colorw,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
