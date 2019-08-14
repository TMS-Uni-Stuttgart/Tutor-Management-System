package de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions;

import javax.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * ExceptionHandlers
 */
@ControllerAdvice
public class ExceptionHandlers extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = ElementNotFoundException.class)
    protected ResponseEntity<Object> handleElementNotFound(ElementNotFoundException ex,
            HttpServletRequest request) {
        if (request.getRequestURI().startsWith("/api")) {
            ExceptionDTO exDTO = new ExceptionDTO(404, ex.getMessage());

            return new ResponseEntity<>(exDTO, HttpStatus.valueOf(exDTO.getStatus()));
        }

        return new ResponseEntity<Object>("redirect:/index.html", HttpStatus.OK);
    }

}
