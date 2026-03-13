import 'package:flutter/material.dart';
import 'package:pdfx/pdfx.dart';

import '../../../shared/theme_control.dart';

class PoliciesPage extends StatefulWidget {
  const PoliciesPage({super.key});

  @override
  State<PoliciesPage> createState() => _PoliciesPageState();
}

class _PoliciesPageState extends State<PoliciesPage> {
  late PdfControllerPinch pdfControllerPinch;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    pdfControllerPinch = PdfControllerPinch(
        document: PdfDocument.openAsset('assets/dec_eval.pdf'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          backgroundColor: ThemeCtrl.colors.backgroundColor,
          centerTitle: true,
          title: const Text('Policies'),
        ),
        backgroundColor: ThemeCtrl.colors.backgroundColor,
        body: Column(
          children: [
            Expanded(
              child: PdfViewPinch(controller: pdfControllerPinch),
            )
          ],
        ));
  }
}
