import 'package:flutter/material.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../controllers/auth_controller.dart';
import '../../../../routes/app_pages.dart';
import '../../../../shared/theme_control.dart';
import '../../../../shared/components/inputfield_w_icon.dart';
import '../pages/init_activity/resetpassword_page.dart';

class LoginFormWidget extends StatefulWidget {
  const LoginFormWidget({super.key});

  @override
  State<LoginFormWidget> createState() => _LoginFormWidgetState();
}

class _LoginFormWidgetState extends State<LoginFormWidget> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _keepLogin = false;
  bool _hidePassword = true;

  final AuthController _authController = Get.find<AuthController>();

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      
      _authController.login(
        _emailController.text.trim(), 
        _passwordController.text, 
        _keepLogin
      );
    }
  }

  void _toggleCheckBox(bool val) {
    setState(() {
      _keepLogin = !_keepLogin;
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Container(
      height: screen.height * 0.65,
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
                color: ThemeCtrl.colors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Login to your account",
              style: TextStyle(color: ThemeCtrl.colors.textMuted),
            ),
            const SizedBox(height: 24),
            InputField1(
              hint: "Email",
              icon: Icons.mail,
              controller: _emailController,
            ),
            const SizedBox(height: 15),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Transform.scale(
                      scale: 0.8,
                      child: Checkbox(
                          activeColor: ThemeCtrl.colors.buttonPrimary,
                          value: _keepLogin,
                          onChanged: (value) {
                            if (value != null) _toggleCheckBox(value);
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
                    Get.to(() => const ResetPasswordPage());
                  },
                  child: Text(
                    "Forgot Password?",
                    style: TextStyle(
                        color: ThemeCtrl.colors.textPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 70),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: Obx(() => ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: ThemeCtrl.colors.buttonPrimary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: _authController.isLoading.value ? null : _submitForm,
                child: _authController.isLoading.value 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Text(
                      "Login",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: ThemeCtrl.colors.surfaceColor,
                      ),
                    ),
              )),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }
}
