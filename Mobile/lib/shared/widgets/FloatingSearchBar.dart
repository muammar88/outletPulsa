import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';

class FloatingSearchBar extends StatefulWidget {
  final TextEditingController controller;
  final Function(String) onChanged;
  final String hintText;

  const FloatingSearchBar({
    Key? key,
    required this.controller,
    required this.onChanged,
    this.hintText = 'Cari...',
  }) : super(key: key);

  @override
  State<FloatingSearchBar> createState() => _FloatingSearchBarState();
}

class _FloatingSearchBarState extends State<FloatingSearchBar> {
  bool _isExpanded = false;
  final FocusNode _focusNode = FocusNode();

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _focusNode.requestFocus();
      } else {
        _focusNode.unfocus();
        widget.controller.clear();
        widget.onChanged('');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Determine the width based on expansion state
    final double width = _isExpanded ? MediaQuery.of(context).size.width - 32 : 56.0;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutQuart,
      width: width,
      height: 56.0,
      decoration: BoxDecoration(
        color: const Color(0xFF0F1F6E),
        borderRadius: BorderRadius.circular(_isExpanded ? 16 : 28),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F1F6E).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(_isExpanded ? 16 : 28),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(_isExpanded ? 16 : 28),
            onTap: _isExpanded ? null : _toggleExpanded,
            child: _isExpanded
                ? OverflowBox(
                    alignment: Alignment.centerLeft,
                    maxWidth: MediaQuery.of(context).size.width - 32,
                    minWidth: MediaQuery.of(context).size.width - 32,
                    maxHeight: 56.0,
                    minHeight: 56.0,
                    child: Row(
                      children: [
                        const SizedBox(width: 16),
                        Icon(TablerIcons.search, color: Colors.white70, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: widget.controller,
                            focusNode: _focusNode,
                            onChanged: widget.onChanged,
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                            cursorColor: Colors.white,
                            decoration: InputDecoration(
                              hintText: widget.hintText,
                              hintStyle: GoogleFonts.poppins(color: Colors.white70, fontSize: 14),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(TablerIcons.x, color: Colors.white, size: 20),
                          onPressed: _toggleExpanded,
                        ),
                      ],
                    ),
                  )
                : const Center(
                    child: Icon(TablerIcons.search, color: Colors.white),
                  ),
          ),
        ),
      ),
    );
  }
}
