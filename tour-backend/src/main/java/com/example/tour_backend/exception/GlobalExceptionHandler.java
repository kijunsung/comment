
package com.example.tour_backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler { //6/30

    // RuntimeException 처리
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        // 클라이언트에 400 Bad Request 상태 코드와 메시지 전송
        return ResponseEntity
                .badRequest()
                .body(ex.getMessage());  //  이게 프론트로 감
    }

}
