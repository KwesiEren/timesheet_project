import 'package:flutter/material.dart';
import '../../shared/img_constant.dart';
import 'package:timesheet_project/shared/button_1.dart';
import 'package:timesheet_project/shared/theme_control.dart';
import 'package:timesheet_project/shared/color_constant.dart';

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
        appBar: AppBar(
          title: const Text('Login Screen'),
          centerTitle: true,
        ),
        body: Container(
          width: screen.width,
          height: screen.height,
          decoration: const BoxDecoration(
              image: DecorationImage(
                  image: AssetImage(ImgAssets.loginBg), fit: BoxFit.cover)),
          child: Container(
            padding: EdgeInsets.all(10),
            color: const Color.fromARGB(162, 5, 142, 221),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 64,
                    backgroundColor: const Color.fromARGB(121, 179, 12, 197),
                    child: CircleAvatar(
                      radius: 60,
                      backgroundColor: Colors.white,
                      child: Center(
                        child: Container(
                          width: screen.width * 0.30,
                          height: screen.height * 0.08,
                          decoration: const BoxDecoration(
                              // color: Colors.white,
                              image: DecorationImage(
                                  image: AssetImage(ImgAssets.appLogo),
                                  fit: BoxFit.fill)),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 5.0, right: 5.0),
                    child: Column(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Email',
                              style: TextStyle(
                                fontFamily: 'Comfortaa',
                                fontSize: 15,
                                color: ThemeCtrl.colors.colortxt1,
                              ),
                            ),
                            Container(
                              margin: EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                  color:
                                      const Color.fromARGB(255, 247, 247, 247),
                                  borderRadius: BorderRadius.circular(5),
                                  border: Border.all(
                                      color:
                                          const Color.fromARGB(122, 0, 0, 0))),
                              child: TextFormField(
                                decoration: const InputDecoration(
                                    contentPadding: EdgeInsets.only(left: 5),
                                    // filled: true,
                                    border: InputBorder.none,
                                    hintText: 'JohnDoe@yahoo.com',
                                    hintStyle: TextStyle(
                                        color: Color.fromARGB(103, 0, 0, 0))),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Email will remain unchanged if empty';
                                  }
                                  if (!RegExp(
                                          r'^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$')
                                      .hasMatch(value)) {
                                    return 'Enter a valid Email address';
                                  }
                                  return null;
                                },
                                onSaved: (value) {
                                  _username = value!;
                                },
                              ),
                            ),
                            Text(
                              'Password',
                              style: TextStyle(
                                fontFamily: 'Comfortaa',
                                fontSize: 15,
                                color: ThemeCtrl.colors.colortxt1,
                              ),
                            ),
                            Container(
                              margin: EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                  color:
                                      const Color.fromARGB(255, 247, 247, 247),
                                  borderRadius: BorderRadius.circular(5),
                                  border: Border.all(
                                      color:
                                          const Color.fromARGB(122, 0, 0, 0))),
                              child: TextFormField(
                                obscureText: true,
                                obscuringCharacter: '*',
                                decoration: const InputDecoration(
                                    contentPadding: EdgeInsets.only(left: 5),
                                    // filled: true,
                                    border: InputBorder.none,
                                    hintText: '********',
                                    hintStyle: TextStyle(
                                        color: Color.fromARGB(103, 0, 0, 0))),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Password is needed';
                                  }
                                  if (value.length < 8) {
                                    return 'Password must be at least 8 characters long.';
                                  }
                                  return null;
                                },
                                onSaved: (value) {
                                  _password = value!;
                                },
                              ),
                            ),
                          ],
                        ),
                        ActionButton1(
                          text: 'Sign In',
                          btnColor: ThemeCtrl.colors.colorbtn1,
                          size: 20,
                          borderRadius: 5,
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ));
  }
}
