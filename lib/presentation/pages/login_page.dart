import 'package:flutter/material.dart';
import '../../shared/img_constant.dart';
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
        // appBar: AppBar(
        //   title: const Text('Login Screen'),
        //   centerTitle: true,
        // ),
        body: SafeArea(
      child: SingleChildScrollView(
        child: Container(
          width: screen.width,
          height: screen.height,
          decoration: const BoxDecoration(
              image: DecorationImage(
                  image: AssetImage(ImgAssets.imgBg), fit: BoxFit.cover)),
          child: Container(
            // width: screen.width,
            // height: screen.height,
            padding: const EdgeInsets.all(10),
            // color: ThemeCtrl.colors.colorbg,
            child: Column(
              children: [
                SizedBox(
                  height: 20,
                ),
                Container(
                  width: screen.width * 0.8,
                  height: screen.height * 0.2,
                  decoration: const BoxDecoration(
                      //  color: ThemeCtrl.colors.colorbg,
                      image: DecorationImage(
                          image: AssetImage(ImgAssets.appLogo),
                          fit: BoxFit.cover)),
                ),
                SizedBox(
                  height: 70,
                ),
                Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
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
                                  decoration: BoxDecoration(
                                      color: const Color.fromARGB(
                                          255, 247, 247, 247),
                                      borderRadius: BorderRadius.circular(5),
                                      border: Border.all(
                                          color: const Color.fromARGB(
                                              122, 0, 0, 0))),
                                  child: TextFormField(
                                    decoration: const InputDecoration(
                                        contentPadding:
                                            EdgeInsets.only(left: 5),
                                        // filled: true,
                                        border: InputBorder.none,
                                        hintText: 'JohnDoe@yahoo.com',
                                        hintStyle: TextStyle(
                                            color:
                                                Color.fromARGB(103, 0, 0, 0))),
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
                                SizedBox(
                                  height: 40,
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
                                  decoration: BoxDecoration(
                                      color: const Color.fromARGB(
                                          255, 247, 247, 247),
                                      borderRadius: BorderRadius.circular(5),
                                      border: Border.all(
                                          color: const Color.fromARGB(
                                              122, 0, 0, 0))),
                                  child: TextFormField(
                                    obscureText: true,
                                    obscuringCharacter: '*',
                                    decoration: const InputDecoration(
                                        contentPadding:
                                            EdgeInsets.only(left: 5),
                                        // filled: true,
                                        border: InputBorder.none,
                                        hintText: '********',
                                        hintStyle: TextStyle(
                                            color:
                                                Color.fromARGB(103, 0, 0, 0))),
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
                            SizedBox(
                              height: 20,
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                ActionButton1(
                                  text: 'Sign In',
                                  btnColor: ThemeCtrl.colors.colorbtn1,
                                  size: 20,
                                  borderRadius: 5,
                                ),
                              ],
                            ),
                            SizedBox(
                              height: 130,
                            ),
                            Text(
                              'v1.0',
                              textAlign: TextAlign.center,
                              // 'This application is designed for employess of CERSGIS only!\n Please delete if you don\'t find yourself in the demographic.\nTHANK YOU!',
                              style: TextStyle(
                                  fontSize: 20,
                                  fontFamily: 'Pacifico',
                                  color: ThemeCtrl.colors.color4),
                            )
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ));
  }
}
