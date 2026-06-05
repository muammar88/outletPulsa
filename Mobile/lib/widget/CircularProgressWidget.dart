import 'package:flutter/material.dart';

class CircularProgressWidget extends StatelessWidget {
  const CircularProgressWidget({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Color(0xFF033047).withOpacity(0.86),
      padding: EdgeInsets.only(top: 20, bottom: 20),
      alignment: Alignment.center,
      child: Center(child: CircularProgressIndicator()),
    );
  }
}
