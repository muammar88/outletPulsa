import 'package:flutter/material.dart';

class AllBoxLoading extends StatelessWidget {
  const AllBoxLoading({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          SizedBox(
            height: 20,
          ),
          LoadingBox(),
          SizedBox(
            height: 10,
          ),
          LoadingBox(),
          SizedBox(
            height: 10,
          ),
          LoadingBox(),
          SizedBox(
            height: 10,
          ),
          LoadingBox(),
          SizedBox(
            height: 10,
          ),
          LoadingBox(),
          SizedBox(
            height: 10,
          ),
          LoadingBox(),
          SizedBox(
            height: 10,
          ),
          LoadingBox()
        ],
      ),
    );
  }
}

class LoadingBox extends StatelessWidget {
  const LoadingBox({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
              decoration: BoxDecoration(
                  color: Color.fromARGB(255, 240, 240, 240),
                  borderRadius: BorderRadius.circular(3)),
              height: 80,
              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              child: Row(
                children: [
                  Container(
                      width: 50,
                      height: 63,
                      color: Color.fromARGB(255, 197, 197, 197)),
                  SizedBox(
                    width: 10,
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                                height: 15,
                                width: 100,
                                color:
                                    const Color.fromARGB(255, 197, 197, 197)),
                          ],
                        ),
                        SizedBox(
                          height: 7,
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                  height: 15,
                                  color:
                                      const Color.fromARGB(255, 197, 197, 197)),
                            ),
                          ],
                        ),
                        SizedBox(
                          height: 7,
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                  height: 15,
                                  color:
                                      const Color.fromARGB(255, 197, 197, 197)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              )),
        ),
      ],
    );
  }
}
