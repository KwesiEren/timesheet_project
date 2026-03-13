import 'package:get/get.dart';

import '../presentation/pages/init_activity/login_page.dart';
import '../presentation/pages/init_activity/splash_page.dart';
import '../presentation/pages/main_activity/home_page.dart';

part 'app_routes.dart';

class AppPages {
  static const INITIAL = Routes.SPLASH;

  static final routes = [
    GetPage(
      name: _Paths.SPLASH,
      page: () => const SplashPage(),
    ),
    GetPage(
      name: _Paths.HOME,
      page: () => const HomePage(),
    ),
    GetPage(
      name: _Paths.LOGIN,
      page: () => const LoginPage(),
    ),
  ];
}
