import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:timesheet_project/shared/placeholders.dart';
import 'package:timesheet_project/shared/theme_control.dart';

import '../../../shared/components/button_1.dart';

class PunchInScreen extends StatefulWidget {
  @override
  _PunchInScreenState createState() => _PunchInScreenState();
}

class _PunchInScreenState extends State<PunchInScreen> {
  Duration remainingTime = const Duration(hours: 9);
  bool isBreakActive = false;
  bool isTimerRunning = false;
  Timer? countdown;
  Timer? worktimer;
  Timer? breaktimer;
  Duration elapsedWorkTime = Duration.zero;
  Duration elapsedBreakTime = Duration.zero;

  void startTimer() {
    if (worktimer != null && worktimer!.isActive) {
      // Prevent multiple work timers from starting
      return;
    }

    setState(() {
      isTimerRunning = true;
    });

    worktimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        elapsedWorkTime = elapsedWorkTime + const Duration(seconds: 1);
      });
    });
  }

  void pauseTimer() {
    if (worktimer != null) {
      worktimer?.cancel();
    }

    setState(() {
      isBreakActive = true;
    });
  }

  void stopTimer() {
    if (worktimer != null) {
      worktimer?.cancel();
    }

    setState(() {
      isTimerRunning = false;
    });
  }

  void resetTimer() {
    stopTimer(); // Ensure timer is stopped before resetting
    setState(() {
      elapsedWorkTime = Duration.zero;
      elapsedBreakTime = Duration.zero;
    });
  }

  void startBreakTimer() {
    pauseTimer();
    breaktimer = Timer.periodic(const Duration(seconds: 1), (worktimer) {
      setState(() {
        elapsedBreakTime = elapsedBreakTime + const Duration(seconds: 1);
      });
    });
  }

  void stopBreakTimer() {
    setState(() {
      isBreakActive = false;
    });
    breaktimer?.cancel();
  }

  // Starts the countdown timer
  void _startCountdown() {
    if (countdown != null && countdown!.isActive) {
      // Prevent multiple countdown timers from starting
      return;
    }

    // setState(() {
    //   isTimerRunning = true;
    // });
    startTimer();

    countdown = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (remainingTime.inSeconds > 0) {
        setState(() {
          remainingTime = remainingTime - const Duration(seconds: 1);
        });
      } else {
        countdown!.cancel();
        stopTimer();
        stopBreakTimer();
      }
    });
  }

  void _stopCountdown() {
    if (countdown != null) {
      countdown?.cancel();
    }

    setState(() {
      // isTimerRunning = false;
      stopTimer(); // Reset elapsed work time properly
    });
  }

  String formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    String hours = twoDigits(duration.inHours);
    String minutes = twoDigits(duration.inMinutes.remainder(60));
    String seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$hours:$minutes:$seconds";
  }

  @override
  void dispose() {
    worktimer?.cancel();
    super.dispose();
  }

  void _toPreviousScreen() {
    Get.back();
  }

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    var textScale = MediaQuery.of(context).textScaleFactor;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: ThemeCtrl.colors.colorbtn1),
          onPressed: _toPreviousScreen,
        ),
        title: const Text(
          'Punch In',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: screen.width * 0.04,
            vertical: screen.height * 0.02,
          ),
          child: Column(
            children: [
              // Timer Section
              Container(
                padding: EdgeInsets.all(screen.width * 0.04),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: isTimerRunning
                      ? ThemeCtrl.colors.colorbtn1
                      : ThemeCtrl.colors.color3,
                  borderRadius: BorderRadius.circular(screen.width * 0.03),
                ),
                child: Column(
                  children: [
                    Text(
                      'Current count',
                      style: TextStyle(
                        fontSize: 16 * textScale,
                        color: isTimerRunning
                            ? ThemeCtrl.colors.colorw
                            : ThemeCtrl.colors.colortxt1,
                      ),
                    ),
                    SizedBox(height: screen.height * 0.01),
                    Text(
                      formatDuration(remainingTime),
                      style: TextStyle(
                        fontSize: screen.width * 0.08,
                        fontWeight: FontWeight.bold,
                        color: isTimerRunning
                            ? ThemeCtrl.colors.color3
                            : ThemeCtrl.colors.colortxt1,
                      ),
                    ),
                    if (isTimerRunning)
                      Column(
                        children: [
                          SizedBox(height: screen.height * 0.02),
                          Icon(
                            Icons.timelapse_rounded,
                            color: ThemeCtrl.colors.colorw,
                            size: screen.width * 0.3,
                          ),
                          SizedBox(height: screen.height * 0.03),
                        ],
                      )
                    else
                      SizedBox(height: screen.height * 0.01),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        MyPlaceholders.StatColumn1(
                          label: 'Day total',
                          value: formatDuration(elapsedWorkTime),
                          color: isTimerRunning
                              ? ThemeCtrl.colors.color3
                              : ThemeCtrl.colors.colortxt1,
                        ),
                        MyPlaceholders.StatColumn1(
                          label: 'Break total',
                          value: formatDuration(elapsedBreakTime),
                          color: isTimerRunning
                              ? ThemeCtrl.colors.color3
                              : ThemeCtrl.colors.colortxt1,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: screen.height * 0.02),

              // Notes Section
              TextField(
                decoration: InputDecoration(
                  hintText: 'Notes...',
                  prefixIcon: const Icon(Icons.edit, color: Colors.teal),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(screen.width * 0.02),
                  ),
                ),
              ),

              // const Spacer(),
              SizedBox(height: screen.height * 0.03),

              // Buttons Section
              if (isTimerRunning)
                Column(
                  children: [
                    SizedBox(height: screen.height * 0.1),
                    isBreakActive
                        ? ActionButton1(
                            onPressed: () {
                              stopBreakTimer();
                              startTimer();
                            },
                            text: 'Continue',
                            txtcolor: ThemeCtrl.colors.color3,
                            btnWidth: screen.width * 0.7,
                            btnHeight: screen.height * 0.06,
                            size: 20,
                            btnColor: ThemeCtrl.colors.colorg,
                            borderRadius: screen.height * 0.02,
                          )
                        : ActionButton1(
                            onPressed: () {
                              startBreakTimer();
                            },
                            text: 'Break',
                            txtcolor: ThemeCtrl.colors.color3,
                            btnWidth: screen.width * 0.7,
                            btnHeight: screen.height * 0.06,
                            size: 20,
                            btnColor: ThemeCtrl.colors.colorg,
                            borderRadius: screen.height * 0.02,
                          ),
                    SizedBox(height: screen.height * 0.02),
                    ActionButton1(
                      onPressed: () {
                        _stopCountdown();
                        // stopTimer();
                        // resetTimer();
                      },
                      text: 'Punch Out',
                      txtcolor: ThemeCtrl.colors.color3,
                      btnWidth: screen.width * 0.7,
                      btnHeight: screen.height * 0.08,
                      size: 20,
                      btnColor: ThemeCtrl.colors.colorr,
                      borderRadius: screen.height * 0.02,
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    SizedBox(height: screen.height * 0.4),
                    ActionButton1(
                      onPressed: () {
                        // startTimer();
                        _startCountdown();
                      },
                      text: 'Punch In',
                      txtcolor: ThemeCtrl.colors.color3,
                      btnWidth: screen.width * 0.7,
                      btnHeight: screen.height * 0.08,
                      size: 30,
                      btnColor: ThemeCtrl.colors.colorbtn1,
                      borderRadius: screen.height * 0.02,
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
