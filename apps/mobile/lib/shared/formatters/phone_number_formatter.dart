// 휴대폰 번호 입력을 3-4-4 형태(예. 010 1234 5678)로 자동 띄어쓰기 처리하는 TextInputFormatter.

import 'package:flutter/services.dart';

class PhoneNumberFormatter extends TextInputFormatter {
    @override
    TextEditingValue formatEditUpdate(
        TextEditingValue oldValue,
        TextEditingValue newValue,
    ) {
        var digits = newValue.text.replaceAll(RegExp(r'\D'), '');
        if (digits.length > 11) digits = digits.substring(0, 11);
        final buf = StringBuffer();
        for (var i = 0; i < digits.length; i++) {
            if (i == 3 || i == 7) buf.write(' ');
            buf.write(digits[i]);
        }
        final formatted = buf.toString();
        return TextEditingValue(
            text: formatted,
            selection: TextSelection.collapsed(offset: formatted.length),
        );
    }
}
