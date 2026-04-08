import 'package:flutter/material.dart';
import '../../widgets/login_header_widget.dart';
import '../../widgets/login_form_widget.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: const [
              LoginHeaderWidget(),
              LoginFormWidget(),
            ],
          ),
        ),
      ),
    );
  }
}

