import 'dart:async';
import 'login_page.dart';
import 'package:get/get.dart';
import '../sketchs/loginpage.dart';
import 'package:flutter/material.dart';
import '../../shared/img_constant.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  // Logic For Splash Screen Here;
  Timer? _timer;

  @override
  void initState() {
    // implement on initState
    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      _toNextScreen();
      timer.cancel();
    });
    super.initState();
  }

  void _toNextScreen() async {
    Get.to(const Login());
  }

  // UI Codes Implementation Here;
  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Splash Screen'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Container(
          width: screen.width,
          height: screen.height,
          decoration: const BoxDecoration(
              image: DecorationImage(
                  image: AssetImage(ImgAssets.splashBg), fit: BoxFit.cover)),
          child: Container(
            color: const Color.fromARGB(169, 5, 142, 221),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 92,
                    backgroundColor: const Color.fromARGB(121, 179, 12, 197),
                    child: CircleAvatar(
                      radius: 90,
                      backgroundColor: Colors.white,
                      child: Center(
                        child: Container(
                          width: screen.width * 0.35,
                          height: screen.height * 0.1,
                          decoration: const BoxDecoration(
                              // color: Colors.white,
                              image: DecorationImage(
                                  image: AssetImage(ImgAssets.appLogo),
                                  fit: BoxFit.fill)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 5,
                  ),
                  const Text(
                    'We Make a Difference.',
                    style: TextStyle(
                        fontFamily: 'Pacifico',
                        fontSize: 30,
                        color: Colors.white),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
