package org.isaac.techinventoryservice.infrastructure.web.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.isaac.techinventoryservice.domain.exception.DomainException;
import org.isaac.techinventoryservice.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private final HttpServletRequest request = mock(HttpServletRequest.class);

    @BeforeEach
    void setUp() {
        when(request.getRequestURI()).thenReturn("/api/v1/assets");
    }

    @Test
    void domainException_returns400WithErrorResponse() {
        ResponseEntity<ErrorResponse> response = handler.domainException(new DomainException("bad request"), request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().timestamp()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(400);
        assertThat(response.getBody().error()).isEqualTo("Bad Request");
        assertThat(response.getBody().message()).isEqualTo("bad request");
        assertThat(response.getBody().path()).isEqualTo("/api/v1/assets");
    }

    @Test
    void validationException_returns400WithErrorResponse() {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "asset");
        bindingResult.addError(new FieldError("asset", "brand", "must not be blank"));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.validationException(ex, request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(400);
        assertThat(response.getBody().error()).isEqualTo("Bad Request");
        assertThat(response.getBody().message()).isEqualTo("brand: must not be blank");
        assertThat(response.getBody().path()).isEqualTo("/api/v1/assets");
    }

    @Test
    void resourceNotFoundException_returns404WithErrorResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.resourceNotFoundException(new ResourceNotFoundException("Asset not found with id: abc"), request);

        assertThat(response.getStatusCode().value()).isEqualTo(404);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(404);
        assertThat(response.getBody().error()).isEqualTo("Not Found");
        assertThat(response.getBody().message()).isEqualTo("Asset not found with id: abc");
        assertThat(response.getBody().path()).isEqualTo("/api/v1/assets");
    }

    @Test
    void dataIntegrityViolationException_returns409WithErrorResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.dataIntegrityViolationException(new DataIntegrityViolationException("Duplicate entry", new Exception("internal")), request);

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(409);
        assertThat(response.getBody().error()).isEqualTo("Conflict");
        assertThat(response.getBody().message()).isEqualTo("Data integrity violation");
        assertThat(response.getBody().message()).doesNotContain("Duplicate entry");
        assertThat(response.getBody().path()).isEqualTo("/api/v1/assets");
    }

    @Test
    void dataAccessException_returns500WithGenericMessage() {
        ResponseEntity<ErrorResponse> response =
                handler.dataAccessException(new DataAccessException("connection refused", new Exception("root cause")) {}, request);

        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(500);
        assertThat(response.getBody().error()).isEqualTo("Internal Server Error");
        assertThat(response.getBody().message()).isEqualTo("An error occurred while accessing the database");
        assertThat(response.getBody().message()).doesNotContain("connection refused");
        assertThat(response.getBody().path()).isEqualTo("/api/v1/assets");
    }

    @Test
    void genericException_returns500WithGenericMessage() {
        ResponseEntity<ErrorResponse> response =
                handler.genericException(new IllegalStateException("secret internal detail"), request);

        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(500);
        assertThat(response.getBody().error()).isEqualTo("Internal Server Error");
        assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred");
        assertThat(response.getBody().message()).doesNotContain("secret internal detail");
        assertThat(response.getBody().path()).isEqualTo("/api/v1/assets");
    }
}