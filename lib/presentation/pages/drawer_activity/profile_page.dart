import 'package:flutter/material.dart';
import 'package:timesheet_project/shared/components/button_1.dart';

import '../../../shared/theme_control.dart';
import '../../../shared/validation.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final _formKey = GlobalKey<FormState>();

  String? _email;
  String? _password;
  String? _cpassword;
  final valid = ValidationClass();

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: ThemeCtrl.colors.backgroundColor,
        centerTitle: true,
        title: const Text('Profile'),
      ),
      backgroundColor: ThemeCtrl.colors.backgroundColor,
      body: SafeArea(
          child: Center(
        child: Container(
          padding: const EdgeInsets.all(10),
          width: screen.width,
          decoration:
              //Background Image block:
              BoxDecoration(color: ThemeCtrl.colors.backgroundColor),
          child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  Container(
                    padding: const EdgeInsets.all(15),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Email: ',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          height: 50,
                          decoration:
                              //Background Image block:
                              BoxDecoration(
                                  borderRadius: BorderRadius.circular(5),
                                  border:
                                      Border.all(color: Colors.black, width: 1),
                                  color:
                                      const Color.fromARGB(255, 255, 255, 255)),
                          child: Padding(
                            padding: const EdgeInsets.only(left: 8),
                            child: TextFormField(
                              decoration: const InputDecoration(
                                  border: InputBorder.none,
                                  hintText: 'JohnDoe@gmail.com',
                                  hintStyle: TextStyle(
                                      color: Color.fromARGB(103, 0, 0, 0))),
                              validator: (value) {
                                if (!RegExp(
                                        r'^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$')
                                    .hasMatch(value!)) {
                                  return valid.validateEmail(value);
                                }
                                return null;
                              },
                              onSaved: (value) {
                                _email = value!;
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(15),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Password: ',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          height: 50,
                          decoration:
                              //Background Image block:
                              BoxDecoration(
                                  borderRadius: BorderRadius.circular(5),
                                  border: Border.all(
                                      color: const Color.fromARGB(255, 2, 2, 2),
                                      width: 1),
                                  color:
                                      const Color.fromARGB(255, 255, 255, 255)),
                          child: Padding(
                            padding: const EdgeInsets.only(left: 8),
                            child: TextFormField(
                              obscureText: true,
                              obscuringCharacter: '*',
                              decoration: const InputDecoration(
                                  border: InputBorder.none,
                                  hintText: '*********',
                                  hintStyle: TextStyle(
                                      color: Color.fromARGB(103, 0, 0, 0))),
                              validator: (value) {
                                if (value!.length < 8) {
                                  return 'Password must be at least 8 characters long.';
                                }
                                return null;
                              },
                              onSaved: (value) {
                                _password = value!;
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(15),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          ' Confirm Password: ',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          height: 50,
                          decoration:
                              //Background Image block:
                              BoxDecoration(
                                  borderRadius: BorderRadius.circular(5),
                                  border: Border.all(
                                      color: const Color.fromARGB(255, 2, 2, 2),
                                      width: 1),
                                  color:
                                      const Color.fromARGB(255, 255, 255, 255)),
                          child: Padding(
                            padding: const EdgeInsets.only(left: 8),
                            child: TextFormField(
                              obscureText: true,
                              obscuringCharacter: '*',
                              decoration: const InputDecoration(
                                  border: InputBorder.none,
                                  hintText: '*********',
                                  hintStyle: TextStyle(
                                      color: Color.fromARGB(103, 0, 0, 0))),
                              validator: (value) {
                                if (value!.length < 8) {
                                  return valid.validatePassword(value);
                                }
                                if (value != _password) {
                                  return 'Password does not match!';
                                }
                                return null;
                              },
                              onSaved: (value) {
                                _cpassword = value;
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 200),
                  GestureDetector(
                      onTap: () {},
                      child: ActionButton1(
                          text: 'Save Changes',
                          size: 25,
                          btnColor: ThemeCtrl.colors.primaryColor,
                          borderRadius: 5))
                ],
              )),
        ),
      )),
    );
  }
}
