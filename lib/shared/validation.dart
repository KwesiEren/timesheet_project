class ValidationClass {
  String? validateEmail(String? key) {
    if (key == null || key.isEmpty) {
      return 'Email is required';
    }
    // Regular expression for basic email format validation
    String emailPattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
    RegExp regex = RegExp(emailPattern);
    if (!regex.hasMatch(key)) {
      return 'Enter a valid email address';
    }
    return null;
  }

  String? validatePassword(
    String? key,
    /*String input*/
  ) {
    if (key == null || key.isEmpty) {
      return 'Password will remain unchanged if empty';
    }
    if (key.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return null;
    // if (key != input) {
    //   return 'Password does not match!';
    // }
    // return null;
  }
}
