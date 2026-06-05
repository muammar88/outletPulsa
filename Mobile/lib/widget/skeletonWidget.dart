import 'package:flutter/material.dart';

class SkeletonWidget extends StatelessWidget {
  SkeletonWidget({
    required this.height,
    required this.width,
    required this.radius,
    required this.color,
    Key? key,
  }) : super(key: key);

  double height;
  double width;
  double radius;
  String color = 'dark';

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
          color: color == 'dark'
              ? Colors.black.withOpacity(0.04)
              : Colors.white.withOpacity(0.14),
          borderRadius: BorderRadius.all(Radius.circular(radius))),
    );
  }
}
