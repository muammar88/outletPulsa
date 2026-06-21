import 'package:flutter/material.dart';

class SkeletonWidget extends StatefulWidget {
  final double height;
  final double width;
  final double radius;
  final String color;

  const SkeletonWidget({
    required this.height,
    required this.width,
    required this.radius,
    this.color = 'dark',
    Key? key,
  }) : super(key: key);

  @override
  State<SkeletonWidget> createState() => _SkeletonWidgetState();
}

class _SkeletonWidgetState extends State<SkeletonWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = widget.color == 'dark';

    // Premium modern skeleton colors
    Color baseColor =
        isDark ? Colors.grey.shade200 : Colors.white.withOpacity(0.1);
    Color highlightColor =
        isDark ? Colors.grey.shade100 : Colors.white.withOpacity(0.3);

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          height: widget.height,
          width: widget.width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.all(Radius.circular(widget.radius)),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              stops: const [0.1, 0.5, 0.9],
              colors: [
                baseColor,
                highlightColor,
                baseColor,
              ],
              transform:
                  _SlidingGradientTransform(slidePercent: _animation.value),
            ),
          ),
        );
      },
    );
  }
}

class _SlidingGradientTransform extends GradientTransform {
  final double slidePercent;
  const _SlidingGradientTransform({required this.slidePercent});

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(bounds.width * slidePercent, 0.0, 0.0);
  }
}
